/**
 * Narrative content bodies are authored as arrays of source-wrapped lines (~78 columns), with a
 * blank "" entry marking a real paragraph/section break -- same convention across content/logs/,
 * content/endings/, content/cameras/, and content/emails/. Rendering every array element as its
 * own <p> breaks sentences mid-thought (regression: see EndingScreen); this groups consecutive
 * non-blank lines back into one paragraph, splitting only on the blank-line markers. Each line is
 * trimmed before joining so a source-formatting indent (e.g. a quoted block) doesn't leave a
 * stray double space where two lines meet.
 */
export function paragraphsFrom(lines: string[]): string[] {
  const paragraphs: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (line === "") {
      if (current.length > 0) paragraphs.push(current.map((l) => l.trim()).join(" "));
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) paragraphs.push(current.map((l) => l.trim()).join(" "));
  return paragraphs;
}
