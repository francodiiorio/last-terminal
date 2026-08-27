import { describe, expect, it } from "vitest";
import { encodeWavMono, renderTrack, synthesizeWav } from "@/audio/synth";
import { SOUND_DEFS } from "@/audio/soundDefs";

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset]! | (bytes[offset + 1]! << 8) | (bytes[offset + 2]! << 16) | (bytes[offset + 3]! << 24);
}

describe("renderTrack", () => {
  it("renders each segment's duration at the given sample rate", () => {
    const track = renderTrack([{ wave: "sine", freq: 440, duration: 0.1, volume: 1 }], 1000);
    expect(track.length).toBe(100);
  });

  it("concatenates multiple segments in order", () => {
    const track = renderTrack(
      [
        { wave: "sine", freq: 440, duration: 0.01, volume: 1 },
        { wave: "square", freq: 220, duration: 0.02, volume: 1 },
      ],
      1000,
    );
    expect(track.length).toBe(10 + 20);
  });

  it("never exceeds the requested peak amplitude", () => {
    const track = renderTrack([{ wave: "sine", freq: 440, duration: 0.05, volume: 0.4 }], 8000);
    for (const sample of track) {
      expect(Math.abs(sample)).toBeLessThanOrEqual(0.4 + 1e-6);
    }
  });

  it("noise segments stay within [-volume, volume]", () => {
    const track = renderTrack([{ wave: "noise", duration: 0.05, volume: 0.3 }], 8000);
    for (const sample of track) {
      expect(Math.abs(sample)).toBeLessThanOrEqual(0.3 + 1e-6);
    }
  });
});

describe("encodeWavMono", () => {
  it("produces a valid RIFF/WAVE header with a matching data size", () => {
    const samples = renderTrack([{ wave: "sine", freq: 440, duration: 0.02, volume: 0.5 }], 8000);
    const bytes = encodeWavMono(samples, 8000);

    expect(readAscii(bytes, 0, 4)).toBe("RIFF");
    expect(readAscii(bytes, 8, 4)).toBe("WAVE");
    expect(readAscii(bytes, 12, 4)).toBe("fmt ");
    expect(readAscii(bytes, 36, 4)).toBe("data");

    const dataSize = readUint32LE(bytes, 40);
    expect(dataSize).toBe(samples.length * 2); // 16-bit mono
    expect(bytes.length).toBe(44 + dataSize);
  });
});

describe("SOUND_DEFS", () => {
  it("every defined sound synthesizes to a non-empty, well-formed WAV", () => {
    for (const id of Object.keys(SOUND_DEFS) as Array<keyof typeof SOUND_DEFS>) {
      const bytes = synthesizeWav(SOUND_DEFS[id].segments);
      expect(bytes.length).toBeGreaterThan(44);
      expect(readAscii(bytes, 0, 4)).toBe("RIFF");
    }
  });
});
