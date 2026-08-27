import { EN, type Strings } from "@/i18n/en";
import { ES_AR } from "@/i18n/es-AR";
import type { Language } from "@/core/language";

export type { Strings } from "@/i18n/en";

export const STRINGS: Record<Language, Strings> = { en: EN, "es-AR": ES_AR };

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  "es-AR": "Español (Argentina)",
};

export function stringsFor(language: Language): Strings {
  return STRINGS[language];
}
