/**
 * Two languages ship: English and Argentine Spanish (voseo, Rioplatense vocabulary). "Localized"
 * content -- both UI chrome strings and narrative content bodies -- is authored as one object
 * with a value per language, so TypeScript enforces every piece of content has both before it
 * ships (a missing translation is a compile error, not a runtime gap).
 */
export type Language = "en" | "es-AR";

export const LANGUAGES: Language[] = ["en", "es-AR"];
export const DEFAULT_LANGUAGE: Language = "en";

export type Localized<T> = Record<Language, T>;

export function pick<T>(value: Localized<T>, language: Language): T {
  return value[language] ?? value[DEFAULT_LANGUAGE];
}
