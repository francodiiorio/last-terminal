import { describe, expect, it } from "vitest";
import { canEnable, headroomKw, isLocked, totalConsumptionKw } from "@/game/power/budget";
import type { PowerSystemDef, PowerSystemState } from "@/game/power/types";
import type { EventWorldState } from "@/core/events/types";

const SYSTEMS: PowerSystemDef[] = [
  { id: "life-support", name: "Life Support", consumptionKw: 80, priority: 0, defaultOn: true, description: "" },
  { id: "terminal", name: "Terminal", consumptionKw: 10, priority: 1, defaultOn: true, description: "" },
  { id: "cameras", name: "Cameras", consumptionKw: 35, priority: 2, defaultOn: true, description: "" },
  { id: "security", name: "Security", consumptionKw: 90, priority: 3, defaultOn: false, description: "" },
  {
    id: "navigation",
    name: "Navigation",
    consumptionKw: 150,
    priority: 4,
    defaultOn: false,
    lockedReason: "not required",
    description: "",
  },
  {
    id: "communications",
    name: "Communications",
    consumptionKw: 120,
    priority: 5,
    defaultOn: false,
    lockedReason: "array offline",
    unlockRequires: [{ type: "flag", flag: "communicationsRepaired", equals: true }],
    description: "",
  },
];
const BUDGET = 180;

function stateWith(onIds: string[]): PowerSystemState {
  const state: PowerSystemState = {};
  for (const sys of SYSTEMS) state[sys.id] = onIds.includes(sys.id) ? "on" : "off";
  return state;
}

function worldWith(power: PowerSystemState, flags: EventWorldState["flags"] = {}): EventWorldState {
  return { flags, power, minutesElapsed: 0 };
}

describe("power budget math", () => {
  it("sums consumption for only the systems that are on", () => {
    const state = stateWith(["life-support", "terminal", "cameras"]);
    expect(totalConsumptionKw(SYSTEMS, state)).toBe(125);
  });

  it("computes headroom as budget minus consumption", () => {
    const state = stateWith(["life-support", "terminal", "cameras"]);
    expect(headroomKw(BUDGET, SYSTEMS, state)).toBe(55);
  });

  it("cannot enable security while cameras are also drawing power (the core slice tradeoff)", () => {
    const state = stateWith(["life-support", "terminal", "cameras"]);
    const security = SYSTEMS.find((s) => s.id === "security")!;
    expect(canEnable(security, SYSTEMS, state, BUDGET, worldWith(state))).toBe(false);
  });

  it("can enable security once cameras are switched off, freeing exact headroom", () => {
    const state = stateWith(["life-support", "terminal"]);
    const security = SYSTEMS.find((s) => s.id === "security")!;
    expect(canEnable(security, SYSTEMS, state, BUDGET, worldWith(state))).toBe(true);
  });

  it("a locked system with no unlock path can never be enabled regardless of headroom", () => {
    const state = stateWith([]);
    const navigation = SYSTEMS.find((s) => s.id === "navigation")!;
    expect(canEnable(navigation, SYSTEMS, state, BUDGET, worldWith(state))).toBe(false);
  });

  it("a system already on is considered enable-able (no-op)", () => {
    const state = stateWith(["security"]);
    const security = SYSTEMS.find((s) => s.id === "security")!;
    expect(canEnable(security, SYSTEMS, state, BUDGET, worldWith(state))).toBe(true);
  });
});

describe("isLocked / unlockRequires", () => {
  const communications = SYSTEMS.find((s) => s.id === "communications")!;
  const navigation = SYSTEMS.find((s) => s.id === "navigation")!;

  it("a system with unlockRequires is locked until its condition is met", () => {
    const state = stateWith([]);
    expect(isLocked(communications, worldWith(state))).toBe(true);
    expect(isLocked(communications, worldWith(state, { communicationsRepaired: true }))).toBe(false);
  });

  it("a system with no unlockRequires but a lockedReason is permanently locked", () => {
    const state = stateWith([]);
    expect(isLocked(navigation, worldWith(state, { anything: true }))).toBe(true);
  });

  it("a system with no lockedReason is never locked", () => {
    const state = stateWith([]);
    const cameras = SYSTEMS.find((s) => s.id === "cameras")!;
    expect(isLocked(cameras, worldWith(state))).toBe(false);
  });

  it("once unlocked, headroom still governs whether it can actually be enabled", () => {
    // life-support(80) + terminal(10) = 90 fixed; 180 - 90 = 90kW headroom, short of the 120kW comms needs
    const state = stateWith(["life-support", "terminal"]);
    const world = worldWith(state, { communicationsRepaired: true });
    expect(isLocked(communications, world)).toBe(false);
    expect(canEnable(communications, SYSTEMS, state, BUDGET, world)).toBe(false);

    // switching life-support off frees enough headroom (170kW) to cover it
    const state2 = stateWith(["terminal"]);
    const world2 = worldWith(state2, { communicationsRepaired: true });
    expect(canEnable(communications, SYSTEMS, state2, BUDGET, world2)).toBe(true);
  });
});
