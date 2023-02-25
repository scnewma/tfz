import { Config } from "./config.ts";

export function newClient(config: Config): TfcClient {
  return new Client(config.host, config.token);
}

export type ProgressListener = (completed: number, total: number) => void;

export interface TfcClient {
  readonly host: string;
  listWorkspaces(
    org: string,
    listener: ProgressListener | null,
  ): Promise<Workspace[]>;
}

class Client implements TfcClient {
  readonly host: string;
  private readonly token: string;

  constructor(host: string | null, token: string) {
    this.host = host || "app.terraform.io";
    this.token = token;
  }

  async listWorkspaces(
    org: string,
    listener: ProgressListener | null,
  ): Promise<Workspace[]> {
    const workspaces: Workspace[] = [];
    let completed = 0;
    let nextRequest =
      `https://${this.host}/api/v2/organizations/${org}/workspaces`;
    while (nextRequest) {
      const response = await fetch(nextRequest, {
        headers: {
          "Authorization": `Bearer ${this.token}`,
        },
      });
      const data: ListWorkspacesResponse = await response.json();
      workspaces.push(...data.data);
      nextRequest = data.links["next"];

      completed += Math.min(
        data.data.length,
        data.meta.pagination["page-size"],
      );
      if (listener) {
        listener(completed, data.meta.pagination["total-count"]);
      }
    }
    return workspaces;
  }
}

// Note: there is more data in the returned response, but we only care about
// this.
export interface Workspace {
  id: string;
  type: "workspaces";
  attributes: {
    name: string;
  };
  links: Record<string, string>;
}

interface ListWorkspacesResponse {
  data: Workspace[];
  links: Record<string, string>;
  meta: {
    pagination: {
      "page-size": number;
      "total-count": number;
    };
  };
}
