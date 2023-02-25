export async function filter(items: string[]): Promise<string[]> {
  const fzf = Deno.run({
    cmd: ["fzf", "--multi"],
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
