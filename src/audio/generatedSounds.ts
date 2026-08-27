import { synthesizeWav } from "@/audio/synth";
import { SOUND_DEFS } from "@/audio/soundDefs";
import type { SoundId } from "@/audio/manager";

export interface ResolvedSoundDef {
  src: string[];
  loop: boolean;
  volume: number;
}

let cache: Partial<Record<SoundId, ResolvedSoundDef>> | null = null;

function bytesToBlobUrl(bytes: Uint8Array): string {
  // `synthesizeWav` always backs its output with a fresh `new ArrayBuffer(...)`, never a
  // SharedArrayBuffer, so this cast is safe -- TS's DOM lib types BlobPart as ArrayBuffer only.
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

/**
 * Lazily synthesizes and caches every UI sound as a Blob URL. Synthesis only happens on first
 * use (not at module-import time), so importing this module has no side effects in non-browser
 * contexts (tests, SSR) -- only calling this function does, and callers (src/audio/manager.ts)
 * do so defensively.
 */
export function getGeneratedSoundLibrary(): Partial<Record<SoundId, ResolvedSoundDef>> {
  if (cache) return cache;
  const library: Partial<Record<SoundId, ResolvedSoundDef>> = {};
  for (const id of Object.keys(SOUND_DEFS) as SoundId[]) {
    const def = SOUND_DEFS[id];
    const bytes = synthesizeWav(def.segments);
    library[id] = { src: [bytesToBlobUrl(bytes)], loop: def.loop ?? false, volume: def.volume ?? 1 };
  }
  cache = library;
  return library;
}
