export interface Item {
  title: string;
  subtitle: string;
  match: string;
  arg: string;
  autocomplete?: string;
  // mods?
}

export interface ScriptFilterResult {
  items: Item[];
}
