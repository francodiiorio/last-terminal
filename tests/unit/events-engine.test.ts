import { describe, expect, it } from "vitest";
import { runEventCheck } from "@/core/events/engine";
import type { EventWorldState, GameEvent } from "@/core/events/types";

const world = (overrides: Partial<EventWorldState> = {}): EventWorldState => ({
  flags: {},
  power: {},
  minutesElapsed: 0,
  ...overrides,
});

describe("runEventCheck", () => {
  it("fires a once event when its conditions are satisfied", () => {
    const events: GameEvent[] = [
      {
        id: "wake",
        once: true,
        conditions: [{ type: "flag", flag: "wokeUp", equals: true }],
        actions: [{ type: "notification", message: { en: "hello", "es-AR": "hola" } }],
      },
    ];
    const { effects, newlyFiredOnceIds } = runEventCheck(events, world({ flags: { wokeUp: true } }), new Set());
    expect(newlyFiredOnceIds).toEqual(["wake"]);
    expect(effects.notifications).toEqual([{ message: { en: "hello", "es-AR": "hola" }, level: "info" }]);
  });

  it("does not refire a once event already recorded as fired", () => {
    const events: GameEvent[] = [
      {
        id: "wake",
        once: true,
        conditions: [{ type: "flag", flag: "wokeUp", equals: true }],
        actions: [{ type: "notification", message: { en: "hello", "es-AR": "hola" } }],
      },
    ];
    const { effects, newlyFiredOnceIds } = runEventCheck(
      events,
      world({ flags: { wokeUp: true } }),
      new Set(["wake"]),
    );
    expect(newlyFiredOnceIds).toEqual([]);
    expect(effects.notifications).toEqual([]);
  });

  it("does not fire when conditions are unmet", () => {
    const events: GameEvent[] = [
      {
        id: "wake",
        once: true,
        conditions: [{ type: "flag", flag: "wokeUp", equals: true }],
        actions: [{ type: "setFlag", flag: "x", value: true }],
      },
    ];
    const { effects, newlyFiredOnceIds } = runEventCheck(events, world(), new Set());
    expect(newlyFiredOnceIds).toEqual([]);
    expect(effects.setFlags).toEqual([]);
  });

  it("repeatable events fire every time conditions hold and are never recorded as fired", () => {
    const events: GameEvent[] = [
      {
        id: "ambient-warning",
        once: false,
        conditions: [{ type: "power", system: "life-support", state: "off" }],
        actions: [
          { type: "notification", message: { en: "LIFE SUPPORT OFFLINE", "es-AR": "SOPORTE VITAL FUERA DE LÍNEA" }, level: "critical" },
        ],
      },
    ];
    const w = world({ power: { "life-support": "off" } });
    const first = runEventCheck(events, w, new Set());
    const second = runEventCheck(events, w, new Set(first.newlyFiredOnceIds));
    expect(first.newlyFiredOnceIds).toEqual([]);
    expect(first.effects.notifications).toHaveLength(1);
    expect(second.effects.notifications).toHaveLength(1);
  });

  it("applies setPower and setFlag actions into the effects payload", () => {
    const events: GameEvent[] = [
      {
        id: "unlock-security",
        once: true,
        conditions: [{ type: "flag", flag: "ready", equals: true }],
        actions: [
          { type: "setPower", system: "security", state: "on" },
          { type: "setFlag", flag: "securityUnlocked", value: true },
          { type: "unlockFile", fileId: "some-file" },
        ],
      },
    ];
    const { effects } = runEventCheck(events, world({ flags: { ready: true } }), new Set());
    expect(effects.setPower).toEqual([{ system: "security", state: "on" }]);
    expect(effects.setFlags).toEqual([{ flag: "securityUnlocked", value: true }]);
    expect(effects.unlockedFiles).toEqual(["some-file"]);
  });
});
