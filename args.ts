export type Args = {
  sync: boolean;
  mode: "open" | "alfred";
  // only defined if mode == alfred
  filter?: string;
};

// TODO: this doesn't prevent users from passing garbage in that doesn't make
// any sense
export function parseArgs(args: string[]): Args {
  const res: Args = { sync: false, mode: "open" };
  for (const arg of args) {
    if (arg == "--sync" || arg == "-S") {
      res.sync = true;
    } else if (arg == "--alfred" || arg == "-A") {
      res.mode = "alfred";
    } else {
      res.filter = arg;
    }
  }
  return res;
}
