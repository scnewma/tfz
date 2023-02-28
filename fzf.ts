export interface FilterOptions {
  interactive: boolean;
  // either [--filter=STR] if non interactive or [--query=STR] if interactive
  query?: string;
}

export async function filter(
  items: string[],
  options: FilterOptions | undefined,
): Promise<string[]> {
  const opts = options || { interactive: true };
  const cmd = ["fzf", "--multi"];
  if (!opts.interactive) {
    cmd.push("--filter");
    cmd.push(opts.query || "");
  } else if (opts.query) {
    cmd.push("--query")
    cmd.push(opts.query)
  }

  const fzf = Deno.run({
    cmd,
    stdout: "piped",
    stdin: "piped",
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  for (const item of items) {
    await fzf.stdin.write(encoder.encode(item + "\n"));
  }
  fzf.stdin.close();

  const resultBytes = await fzf.output();
  fzf.close();
  const result = decoder.decode(resultBytes);
  return result.trim().split("\n");
}
