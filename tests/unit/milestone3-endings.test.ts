import { describe, expect, it } from "vitest";
import { runEventCheck } from "@/core/events/engine";
import { MILESTONE3_EVENTS } from "@content/events/milestone3-events";
import type { EventWorldState } from "@/core/events/types";

const ENDING_EVENT_IDS = ["ending-custodian", "ending-disclosure", "ending-resonance", "ending-silence"];

interface Signals {
  sentIncidentReport?: boolean;
  readCassiusNote?: boolean;
  lifeSupportOff?: boolean;
  minutesElapsed?: number;
  sessionConcluding?: boolean;
}

function worldFor(signals: Signals): EventWorldState {
  const {
    sentIncidentReport = false,
    readCassiusNote = false,
    lifeSupportOff = false,
    minutesElapsed = 0,
    sessionConcluding = true,
  } = signals;
  return {
    flags: {
      sessionConcluding,
      sentIncidentReport,
      "read:cassius-internal-note": readCassiusNote,
    },
    power: { "life-support": lifeSupportOff ? "off" : "on" },
    minutesElapsed,
  };
}

function firedEndingIds(world: EventWorldState): string[] {
  const { newlyFiredOnceIds } = runEventCheck(MILESTONE3_EVENTS, world, new Set());
  return newlyFiredOnceIds.filter((id) => ENDING_EVENT_IDS.includes(id));
}

describe("ending predicates are mutually exclusive and exhaustive", () => {
  it("A=true, B=true -> Custodian only", () => {
    const fired = firedEndingIds(worldFor({ sentIncidentReport: true, readCassiusNote: true }));
    expect(fired).toEqual(["ending-custodian"]);
  });

  it("A=true, B=false -> Disclosure only", () => {
    const fired = firedEndingIds(worldFor({ sentIncidentReport: true, readCassiusNote: false }));
    expect(fired).toEqual(["ending-disclosure"]);
  });

  it("A=false, C=true (life support off, 40+ min) -> Resonance only", () => {
    const fired = firedEndingIds(worldFor({ lifeSupportOff: true, minutesElapsed: 40 }));
    expect(fired).toEqual(["ending-resonance"]);
  });

  it("A=false, C=false (life support on) -> Silence only", () => {
    const fired = firedEndingIds(worldFor({ lifeSupportOff: false, minutesElapsed: 999 }));
    expect(fired).toEqual(["ending-silence"]);
  });

  it("A=false, C=false (life support off but under the time threshold) -> Silence only", () => {
    const fired = firedEndingIds(worldFor({ lifeSupportOff: true, minutesElapsed: 39 }));
    expect(fired).toEqual(["ending-silence"]);
  });

  it("the default world (nothing set) resolves to Silence, never zero endings", () => {
    const fired = firedEndingIds(worldFor({}));
    expect(fired).toEqual(["ending-silence"]);
  });

  it("no ending fires before sessionConcluding is set", () => {
    const fired = firedEndingIds(worldFor({ sentIncidentReport: true, readCassiusNote: true, sessionConcluding: false }));
    expect(fired).toEqual([]);
  });

  it("exactly one ending fires across every corner of the A/B/C cube", () => {
    for (const sentIncidentReport of [true, false]) {
      for (const readCassiusNote of [true, false]) {
        for (const lifeSupportOff of [true, false]) {
          for (const minutesElapsed of [0, 40]) {
            const fired = firedEndingIds(worldFor({ sentIncidentReport, readCassiusNote, lifeSupportOff, minutesElapsed }));
            expect(fired.length, JSON.stringify({ sentIncidentReport, readCassiusNote, lifeSupportOff, minutesElapsed })).toBe(1);
          }
        }
      }
    }
  });
});

describe("conclude-command-unlocked", () => {
  it("unlocks 'conclude' once the unknown transmission has been read", () => {
    const world: EventWorldState = {
      flags: { "read:communications-incoming": true },
      power: {},
      minutesElapsed: 0,
    };
    const { effects, newlyFiredOnceIds } = runEventCheck(MILESTONE3_EVENTS, world, new Set());
    expect(newlyFiredOnceIds).toContain("conclude-command-unlocked");
    expect(effects.unlockedCommands).toContain("conclude");
  });
});
