export type Args = {
  sync: boolean;
};

// TODO: this doesn't prevent users from passing garbage in that doesn't make
// any sense
export function parseArgs(args: string[]): Args {
  const res: Args = { sync: false };
  for (const arg of args) {
    if (arg == "--sync" || arg == "-S") {
      res.sync = true;
    }
  }
  return res;
}
