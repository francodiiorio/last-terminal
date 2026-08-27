/**
 * Tiny procedural sound synthesizer. Every Last Terminal sound cue is generated from math at
 * runtime (sine/square oscillators + noise, short envelopes) instead of a downloaded asset --
 * see docs/ROADMAP.md's Milestone 4 note. Pure, DOM-free, and unit-testable: this module only
 * produces bytes; src/audio/generatedSounds.ts is the (browser-only) layer that turns those
 * bytes into a Blob the audio manager can play.
 */

export type Wave = "sine" | "square" | "noise";

export interface ToneSegment {
  /** starting frequency in Hz; ignored for "noise" */
  freq?: number;
  /** if set, frequency sweeps linearly from `freq` to `freqEnd` across the segment */
  freqEnd?: number;
  /** seconds */
  duration: number;
  wave: Wave;
  /** peak amplitude, 0..1 */
  volume: number;
}

const DEFAULT_SAMPLE_RATE = 22050;

function renderSegment(segment: ToneSegment, sampleRate: number): Float32Array {
  const sampleCount = Math.max(1, Math.round(segment.duration * sampleRate));
  const out = new Float32Array(sampleCount);
  const attack = Math.min(sampleCount, Math.round(sampleRate * 0.003));
  const release = Math.min(sampleCount, Math.round(sampleRate * 0.008));

  for (let i = 0; i < sampleCount; i++) {
    let raw: number;
    if (segment.wave === "noise") {
      raw = Math.random() * 2 - 1;
    } else {
      const t = i / sampleRate;
      const freqStart = segment.freq ?? 440;
      const freq = segment.freqEnd !== undefined ? freqStart + (segment.freqEnd - freqStart) * (i / sampleCount) : freqStart;
      const phase = freq * t;
      raw = segment.wave === "square" ? (Math.sin(phase * Math.PI * 2) >= 0 ? 1 : -1) : Math.sin(phase * Math.PI * 2);
    }

    let envelope = 1;
    if (i < attack) envelope = i / attack;
    else if (i > sampleCount - release) envelope = (sampleCount - i) / release;

    out[i] = raw * segment.volume * envelope;
  }
  return out;
}

/** Renders a sequence of tone segments back-to-back into one mono sample buffer. */
export function renderTrack(segments: ToneSegment[], sampleRate: number = DEFAULT_SAMPLE_RATE): Float32Array {
  const rendered = segments.map((seg) => renderSegment(seg, sampleRate));
  const total = rendered.reduce((sum, s) => sum + s.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const seg of rendered) {
    out.set(seg, offset);
    offset += seg.length;
  }
  return out;
}

/** Encodes mono 32-bit float samples as a 16-bit PCM WAV file. */
export function encodeWavMono(samples: Float32Array, sampleRate: number = DEFAULT_SAMPLE_RATE): Uint8Array {
  const bytesPerSample = 2;
  const byteRate = sampleRate * bytesPerSample;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, value: string) {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Uint8Array(buffer);
}

export function synthesizeWav(segments: ToneSegment[], sampleRate: number = DEFAULT_SAMPLE_RATE): Uint8Array {
  return encodeWavMono(renderTrack(segments, sampleRate), sampleRate);
}
