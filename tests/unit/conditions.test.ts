import { describe, expect, it } from "vitest";
import { evaluateCondition, evaluateConditions } from "@/core/conditions";
import type { EventWorldState } from "@/core/events/types";

const baseWorld: EventWorldState = {
  flags: { wokeUp: true, sectorCAlertTriggered: false },
  power: { security: "off", "life-support": "on" },
  minutesElapsed: 10,
};

describe("evaluateCondition", () => {
  it("matches a flag condition on equality", () => {
    expect(evaluateCondition({ type: "flag", flag: "wokeUp", equals: true }, baseWorld)).toBe(true);
    expect(evaluateCondition({ type: "flag", flag: "wokeUp", equals: false }, baseWorld)).toBe(false);
  });

  it("treats a missing flag as not matching any concrete value", () => {
    expect(evaluateCondition({ type: "flag", flag: "neverSet", equals: true }, baseWorld)).toBe(false);
  });

  it("matches a power condition by system state", () => {
    expect(evaluateCondition({ type: "power", system: "security", state: "off" }, baseWorld)).toBe(true);
    expect(evaluateCondition({ type: "power", system: "security", state: "on" }, baseWorld)).toBe(false);
  });

  it("matches a time condition within an inclusive range", () => {
    expect(evaluateCondition({ type: "time", minMinutes: 5, maxMinutes: 15 }, baseWorld)).toBe(true);
    expect(evaluateCondition({ type: "time", minMinutes: 11 }, baseWorld)).toBe(false);
    expect(evaluateCondition({ type: "time", maxMinutes: 9 }, baseWorld)).toBe(false);
  });

  it("evaluates 'any' as a logical OR", () => {
    const cond = {
      type: "any" as const,
      conditions: [
        { type: "flag" as const, flag: "sectorCAlertTriggered", equals: true },
        { type: "power" as const, system: "life-support", state: "on" as const },
      ],
    };
    expect(evaluateCondition(cond, baseWorld)).toBe(true);
  });

  it("evaluates 'not' as a negation", () => {
    expect(
      evaluateCondition({ type: "not", condition: { type: "flag", flag: "wokeUp", equals: true } }, baseWorld),
    ).toBe(false);
  });
});

describe("evaluateConditions", () => {
  it("ANDs a list of conditions together", () => {
    expect(
      evaluateConditions(
        [
          { type: "flag", flag: "wokeUp", equals: true },
          { type: "power", system: "security", state: "off" },
        ],
        baseWorld,
      ),
    ).toBe(true);

    expect(
      evaluateConditions(
        [
          { type: "flag", flag: "wokeUp", equals: true },
          { type: "power", system: "security", state: "on" },
        ],
        baseWorld,
      ),
    ).toBe(false);
  });

  it("an empty condition list is vacuously true", () => {
    expect(evaluateConditions([], baseWorld)).toBe(true);
  });
});
