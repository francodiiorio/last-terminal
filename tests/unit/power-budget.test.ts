import { describe, expect, it } from "vitest";
import { canEnable, headroomKw, totalConsumptionKw } from "@/game/power/budget";
import type { PowerSystemDef, PowerSystemState } from "@/game/power/types";

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
];
const BUDGET = 180;

function stateWith(onIds: string[]): PowerSystemState {
  const state: PowerSystemState = {};
  for (const sys of SYSTEMS) state[sys.id] = onIds.includes(sys.id) ? "on" : "off";
  return state;
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
    expect(canEnable(security, SYSTEMS, state, BUDGET)).toBe(false);
  });

  it("can enable security once cameras are switched off, freeing exact headroom", () => {
    const state = stateWith(["life-support", "terminal"]);
    const security = SYSTEMS.find((s) => s.id === "security")!;
    expect(canEnable(security, SYSTEMS, state, BUDGET)).toBe(true);
  });

  it("a locked system can never be enabled regardless of headroom", () => {
    const state = stateWith([]);
    const navigation = SYSTEMS.find((s) => s.id === "navigation")!;
    expect(canEnable(navigation, SYSTEMS, state, BUDGET)).toBe(false);
  });

  it("a system already on is considered enable-able (no-op)", () => {
    const state = stateWith(["security"]);
    const security = SYSTEMS.find((s) => s.id === "security")!;
    expect(canEnable(security, SYSTEMS, state, BUDGET)).toBe(true);
  });
});
