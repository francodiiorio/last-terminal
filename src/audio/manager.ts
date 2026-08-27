import { Howl } from "howler";
import { getGeneratedSoundLibrary, type ResolvedSoundDef } from "@/audio/generatedSounds";

export type SoundId =
  | "ambient"
  | "terminalKey"
  | "notification"
  | "warning"
  | "systemBoot"
  | "powerToggle"
  | "transmission";

class AudioManager {
  private howls = new Map<SoundId, Howl>();
  private muted = false;
  private masterVolume = 0.6;
  private library: Partial<Record<SoundId, ResolvedSoundDef>> | null = null;

  /**
   * Builds the sound library on first use only, and never throws even if Blob/URL synthesis
   * fails for some reason (unsupported environment, etc.) -- audio degrades to a safe no-op
   * exactly like the pre-Milestone-4 empty library did, it just tries first.
   */
  private getLibrary(): Partial<Record<SoundId, ResolvedSoundDef>> {
    if (this.library) return this.library;
    try {
      this.library = getGeneratedSoundLibrary();
    } catch {
      this.library = {};
    }
    return this.library;
  }

  play(id: SoundId): void {
    if (this.muted) return;
    const def = this.getLibrary()[id];
    if (!def) return;

    let howl = this.howls.get(id);
    if (!howl) {
      // `format` is required here: generated sources are Blob URLs with no file extension, so
      // Howler can't infer the codec from the URL the way it can for a real asset path.
      howl = new Howl({ src: def.src, format: ["wav"], loop: def.loop, volume: def.volume * this.masterVolume });
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
    this.howls.forEach((h, id) => {
      const def = this.library?.[id];
      h.volume(volume * (def?.volume ?? 1));
    });
  }
}

export const audioManager = new AudioManager();
