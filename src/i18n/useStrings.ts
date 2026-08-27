import { useGameStore } from "@/store";
import { stringsFor } from "@/i18n";

/** Reactive UI-chrome strings for the player's current language setting. */
export function useStrings() {
  const language = useGameStore((s) => s.settings.language);
  return stringsFor(language);
}
