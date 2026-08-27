import { useGameStore } from "@/store";
import { AUTOSAVE_SLOT, saveGame } from "@/persistence/save";

/**
 * Subscribes to the store and writes a debounced autosave to the "autosave" slot whenever
 * playable state changes. Only active once the player has actually entered the desktop (no
 * point persisting the boot screen).
 */
export function initAutosave(debounceMs = 1200): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const unsubscribe = useGameStore.subscribe((state) => {
    if (state.station.scene !== "desktop") return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void saveGame(AUTOSAVE_SLOT, state.exportSnapshot());
    }, debounceMs);
  });

  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
  };
}
