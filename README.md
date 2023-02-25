# tfz

Fuzzy filter and open all your TFC workspaces.

## Installation

This tool uses [fzf](https://github.com/junegunn/fzf) to do fuzzy finding, make sure you have that installed.

`tfz` is built with [deno](https://deno.land/) install it via:

```
$ deno install -A https://raw.githubusercontent.com/scnewma/tfz/main/tfz.ts
```

## Usage

You must have a valid terraform token first.

```
$ terraform login
```

Create a configuration file with your TFC organization name that you want to filter workspaces for.

```
$ mkdir -p ~/.config/tfz
$ echo '{"org":"<YOUR-ORG-HERE>"}' > ~/.config/tfz/config.json
```

`tfz` filtering works on a local cache so that filtering is FAST. You can instruct `tfz` to refresh it's cache before beginning filtering by passing the `--sync` or `-S` option.

Any selected items are automatically opened in your browser. `tfz` executes `fzf` with `--multi` so you can select multiple workspaces and they will each be opened.

```
$ tfz -S
```

After the cache is populated, you can drop the `-S` to search the local cache quickly.

```
$ tfz
```
