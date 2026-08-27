import type { ToneSegment } from "@/audio/synth";
import type { SoundId } from "@/audio/manager";

export interface GeneratedSoundDef {
  segments: ToneSegment[];
  loop?: boolean;
  volume?: number;
}

/**
 * Every cue is deliberately short, quiet, and understated -- industrial UI feedback, not a
 * soundtrack (see docs/PRODUCT.md's restraint pillar). "ambient" is the only loop, a very quiet
 * two-tone low-frequency hum.
 */
export const SOUND_DEFS: Record<SoundId, GeneratedSoundDef> = {
  terminalKey: {
    segments: [{ wave: "square", freq: 1200, duration: 0.018, volume: 0.12 }],
    volume: 0.5,
  },
  notification: {
    segments: [
      { wave: "sine", freq: 500, duration: 0.06, volume: 0.22 },
      { wave: "sine", freq: 750, duration: 0.09, volume: 0.2 },
    ],
    volume: 0.6,
  },
  warning: {
    segments: [
      { wave: "sine", freq: 600, duration: 0.08, volume: 0.26 },
      { wave: "square", freq: 420, duration: 0.12, volume: 0.22 },
    ],
    volume: 0.6,
  },
  systemBoot: {
    segments: [{ wave: "sine", freq: 220, freqEnd: 440, duration: 0.7, volume: 0.18 }],
    volume: 0.5,
  },
  powerToggle: {
    segments: [
      { wave: "noise", duration: 0.015, volume: 0.18 },
      { wave: "square", freq: 400, duration: 0.025, volume: 0.14 },
    ],
    volume: 0.5,
  },
  transmission: {
    segments: [
      { wave: "noise", duration: 0.2, volume: 0.1 },
      { wave: "sine", freq: 900, duration: 0.15, volume: 0.14 },
    ],
    volume: 0.5,
  },
  ambient: {
    segments: [{ wave: "sine", freq: 55, duration: 4, volume: 0.04 }],
    loop: true,
    volume: 0.35,
  },
};
