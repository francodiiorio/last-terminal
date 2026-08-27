import { describe, expect, it } from "vitest";
import { deserializeSave, serializeSave } from "@/persistence/save";
import { migrateToLatest, CURRENT_SCHEMA_VERSION } from "@/persistence/migrations";
import type { GameSnapshot } from "@/store/types";

const SNAPSHOT: GameSnapshot = {
  story: {
    flags: { wokeUp: true, sectorCAlertTriggered: false },
    firedOnceIds: ["sector-c-motion-alert"],
    endingId: null,
  },
  power: { systems: { "life-support": "on", terminal: "on", cameras: "off", security: "on" } },
  filesystem: { cwd: "/security", unlockedIds: [], readIds: ["engineering-power-log"] },
  apps: { unlockedIds: ["terminal", "power"] },
  terminal: { unlockedCommands: [], history: ["status", "ls"] },
  time: { minutesElapsed: 24 },
  settings: { volume: 0.5, muted: false, reducedMotion: true, language: "en" },
};

describe("save serialization", () => {
  it("round-trips a snapshot through export/import unchanged", () => {
    const json = serializeSave(SNAPSHOT);
    const restored = deserializeSave(json);
    expect(restored).toEqual(SNAPSHOT);
  });

  it("produces human-readable JSON with a schema version envelope", () => {
    const json = serializeSave(SNAPSHOT);
    const parsed = JSON.parse(json);
    expect(parsed.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(parsed.data).toEqual(SNAPSHOT);
  });

  it("rejects malformed JSON", () => {
    expect(() => deserializeSave("not json")).toThrow();
  });

  it("rejects a save file missing the data field", () => {
    expect(() => deserializeSave(JSON.stringify({ schemaVersion: 1 }))).toThrow();
  });
});

describe("migrateToLatest", () => {
  it("passes v1 data through unchanged when already current", () => {
    expect(migrateToLatest(SNAPSHOT, CURRENT_SCHEMA_VERSION)).toEqual(SNAPSHOT);
  });
});
