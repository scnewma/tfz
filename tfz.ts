import Cache from "./cache.ts";
import { parseArgs } from "./args.ts";
import { filter } from "./fzf.ts";
import { newClient as newTfcClient, Workspace } from "./tfc.ts";
import { load as loadConfig } from "./config.ts";
import { ProgressBar } from "./deps.ts";
import { TfzError } from "./errors.ts";
import * as alfred from "./alfred.ts";

async function main() {
  const args = parseArgs(Deno.args);
  const config = await loadConfig();
  const cache = new Cache();

  if (args.sync) {
    const client = newTfcClient(config);
    const progress = new ProgressBar({ title: "Syncing:" });
    progress.render(0);
    const workspaces = await client.listWorkspaces(
      config.org,
      (completed, total) => {
        progress.render(completed, { total });
      },
    );
    await cache.writeWorkspaces(workspaces);
  }

  const workspaces = await cache.readWorkspaces();
  if (workspaces.length == 0) {
    console.error(
      "No workspaces found in cache! Try running with `--sync` to update the cache?",
    );
    return;
  }

  const names = workspaces.map((w) => w.attributes.name);

  switch (args.mode) {
    case "open": {
      const chosen = await filter(names, {
        interactive: true,
        query: args.query,
      });
      for (const item of chosen) {
        const workspace = workspaces.find((w) => w.attributes.name === item);
        if (!workspace) {
          continue;
        }
        const url = getWorkspaceURL(workspace, config.host);
        if (!url) {
          console.debug(`Could not determine workspace URL for ${item}.`);
          continue;
        }
        await open(url);
      }
      break;
    }
    case "alfred": {
      const chosen = await filter(names, {
        interactive: false,
        query: args.query || "",
      });
      const res: alfred.ScriptFilterResult = { items: [] };
      for (const item of chosen) {
        const workspace = workspaces.find((w) => w.attributes.name === item);
        if (!workspace) {
          continue;
        }
        const url = getWorkspaceURL(workspace, config.host);
        if (!url) {
          console.debug(`Could not determine workspace URL for ${item}.`);
          continue;
        }
        const aitem: alfred.Item = {
          title: workspace.attributes.name,
          subtitle: url,
          match: workspace.attributes.name,
          arg: url,
          autocomplete: workspace.attributes.name,
        };
        res.items.push(aitem);
      }
      console.log(JSON.stringify(res));
    }
  }
}

function getWorkspaceURL(
  workspace: Workspace,
  host: string,
): string | null {
  const link = getWorkspaceLink(workspace, "self-html");
  if (!link) {
    return null;
  }
  // the links have a leading / already
  return `https://${host}${link}`;
}

function getWorkspaceLink(
  workspace: Workspace,
  linkName: string,
): string | null {
  return workspace.links[linkName];
}

// TODO: cross platform support
async function open(url: string) {
  const proc = Deno.run({
    cmd: ["open", url],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  await proc.status();
}

function handleError(error: Error): number {
  if (error instanceof TfzError) {
    console.error(`Error (${error.kind}): ${error.message}`);
    return 1;
  } else {
    // unhandled
    throw error;
  }
}

try {
  await main();
} catch (error) {
  Deno.exit(handleError(error));
}
