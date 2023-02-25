import { join } from './deps.ts';
import * as os from './os.ts'
import { ErrorKind, TfzError } from './errors.ts'

export interface Config {
  host: string;
  token: string;
  org: string;
}

// this should eventually be loaded from a configuration directory
export async function load(): Promise<Config> {
  const file = await readConfigFile()
  if (!file.org) {
    throw new TfzError(ErrorKind.Uninitialized)
  }

  const host = "app.terraform.io";
  const token = await getTfcToken(host);
  if (!token) {
    throw new TfzError(ErrorKind.NoTfcToken)
  }
  return { host, org: file.org, token };
}

interface ConfigFile {
  org?: string
}

async function readConfigFile(): Promise<ConfigFile> {
  const path = configPath()
  try {
    const data = await Deno.readTextFile(path)
    return JSON.parse(data)
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error
    }
    return {}
  }
}

function configPath(): string {
  let dir = os.configDir()
  if (!dir) {
    throw new TfzError(ErrorKind.NoConfigDirectory)
  }
  dir = join(dir, 'tfz')
  return join(dir, 'config.json')
}

interface CredFile {
  credentials: Record<string, HostCreds>;
}

interface HostCreds {
  token: string;
}

export async function getTfcToken(host: string): Promise<string | undefined> {
  const home = Deno.env.get("HOME");
  if (!home) {
    throw new TfzError(ErrorKind.NoHomeDirectory)
  }
  const credsFile = join(home, ".terraform.d", "credentials.tfrc.json");
  const raw = await Deno.readTextFile(credsFile);
  const data: CredFile = JSON.parse(raw);
  return data.credentials[host]?.token;
}
