export interface ParsedCommand {
  name: string;
  args: string[];
}

/** Splits on whitespace, respecting simple "double quoted" segments. Pure, no registry lookup. */
export function parseCommandLine(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;

  const tokens: string[] = [];
  const regex = /"([^"]*)"|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(trimmed)) !== null) {
    tokens.push(match[1] ?? match[2] ?? "");
  }

  const [name, ...args] = tokens;
  if (!name) return null;
  return { name: name.toLowerCase(), args };
}
