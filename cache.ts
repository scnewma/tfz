import { Workspace } from "./tfc.ts";
import { join } from "./deps.ts";
import * as os from "./os.ts";
import { ErrorKind, TfzError } from "./errors.ts";

const cacheDir = (() => {
  const d = os.cacheDir();
  if (!d) {
    throw new TfzError(ErrorKind.NoConfigDirectory);
  }
  return join(d, "tfz");
})();

enum CacheKeys {
  Workspaces = "workspaces.json",
}

export default class Cache {
  readonly baseDir: string;
  workspaces: Workspace[];
  constructor() {
    this.baseDir = cacheDir;
    this.workspaces = [];
  }

  async readWorkspaces(): Promise<Workspace[]> {
    if (this.workspaces.length == 0) {
      const data = await this.read(CacheKeys.Workspaces);
      if (data) {
        this.workspaces = JSON.parse(data);
      }
    }
    return this.workspaces;
  }

  writeWorkspaces(workspaces: Workspace[]): Promise<void> {
    this.workspaces = workspaces;
    const data = JSON.stringify(workspaces);
    return this.write(CacheKeys.Workspaces, data);
  }

  async read(key: string): Promise<string | null> {
    const path = join(this.baseDir, key);
    try {
      return await Deno.readTextFile(path);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
      return null;
    }
  }

  async write(key: string, content: string): Promise<void> {
    await Deno.mkdir(this.baseDir, { recursive: true });
    const path = join(this.baseDir, key);
    return Deno.writeTextFile(path, content);
  }
}
