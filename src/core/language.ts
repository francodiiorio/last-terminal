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

const LANGUAGE_STORAGE_KEY = "last-terminal:language";

/**
 * Language is a standalone browser preference (localStorage), not part of any save snapshot --
 * unlike other settings, it should already be correct on the boot screen itself, before any
 * session is loaded, and it should apply the same regardless of which save (if any) gets
 * continued. Wrapped in try/catch: localStorage can throw in restrictive contexts (e.g. Safari
 * private browsing), and that's not worth losing the game over.
 */
export function loadStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" || stored === "es-AR" ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function storeLanguage(language: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // best-effort persistence only
  }
}
