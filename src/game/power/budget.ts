import type { PowerSystemDef, PowerSystemState } from "@/game/power/types";

export function totalConsumptionKw(systems: PowerSystemDef[], state: PowerSystemState): number {
  return systems.reduce((sum, sys) => (state[sys.id] === "on" ? sum + sys.consumptionKw : sum), 0);
}

export function headroomKw(budgetKw: number, systems: PowerSystemDef[], state: PowerSystemState): number {
  return budgetKw - totalConsumptionKw(systems, state);
}

/** Whether `system` could be switched on given current headroom, ignoring its own current state. */
export function canEnable(
  system: PowerSystemDef,
  systems: PowerSystemDef[],
  state: PowerSystemState,
  budgetKw: number,
): boolean {
  if (system.lockedReason) return false;
  if (state[system.id] === "on") return true;
  return headroomKw(budgetKw, systems, state) >= system.consumptionKw;
}

export function toPowerConditionState(state: PowerSystemState): Record<string, "on" | "off"> {
  return state;
}
