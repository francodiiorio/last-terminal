import { Howl } from "howler";

export type SoundId =
  | "ambient"
  | "terminalKey"
  | "notification"
  | "warning"
  | "systemBoot"
  | "powerToggle"
  | "transmission";

interface SoundDef {
  src: string[];
  loop?: boolean;
  volume?: number;
}

/**
 * Intentionally empty until real assets ship (see docs/ROADMAP.md Milestone 4). No entry here
 * means `play()` is a safe no-op -- the manager never references a file that doesn't exist, so
 * it never 404s or throws. Populate an entry (pointing at a file under public/audio/) to enable
 * that sound; no other code needs to change.
 */
const SOUND_LIBRARY: Partial<Record<SoundId, SoundDef>> = {};

class AudioManager {
  private howls = new Map<SoundId, Howl>();
  private muted = false;
  private masterVolume = 0.6;

  play(id: SoundId): void {
    if (this.muted) return;
    const def = SOUND_LIBRARY[id];
    if (!def) return;

    let howl = this.howls.get(id);
    if (!howl) {
      howl = new Howl({ src: def.src, loop: def.loop ?? false, volume: (def.volume ?? 1) * this.masterVolume });
      this.howls.set(id, howl);
    }
    howl.play();
  }

  stop(id: SoundId): void {
    this.howls.get(id)?.stop();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.howls.forEach((h) => h.stop());
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = volume;
    this.howls.forEach((h) => h.volume(volume));
  }
}

export const audioManager = new AudioManager();
