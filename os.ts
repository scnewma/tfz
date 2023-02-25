import { join, cacheDir } from "./deps.ts";

function configDir(): string | null {
  const xdg = Deno.env.get('XDG_CONFIG_HOME')
  if (xdg) {
    return xdg
  }

  const home = Deno.env.get('HOME')
  if (home) {
    return join(home, '.config')
  }

  return null
}

export { cacheDir, configDir }
