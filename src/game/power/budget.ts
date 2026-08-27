import type { EventWorldState } from "@/core/events/types";
import { evaluateConditions } from "@/core/conditions";
import type { PowerSystemDef, PowerSystemState } from "@/game/power/types";

export function totalConsumptionKw(systems: PowerSystemDef[], state: PowerSystemState): number {
  return systems.reduce((sum, sys) => (state[sys.id] === "on" ? sum + sys.consumptionKw : sum), 0);
}

export function headroomKw(budgetKw: number, systems: PowerSystemDef[], state: PowerSystemState): number {
  return budgetKw - totalConsumptionKw(systems, state);
}

/**
 * A system with `lockedReason` starts locked. If it also declares `unlockRequires`, it becomes
 * a normal toggle once those conditions hold (e.g. a repair sequence completed via commands).
 * With `lockedReason` but no `unlockRequires`, it stays locked for the whole session by design
 * (e.g. Navigation -- there is no in-fiction reason to ever need it in this arc).
 */
export function isLocked(system: PowerSystemDef, world: EventWorldState): boolean {
  if (!system.lockedReason) return false;
  if (!system.unlockRequires) return true;
  return !evaluateConditions(system.unlockRequires, world);
}

/** Whether `system` could be switched on given current headroom and unlock state, ignoring its own current state. */
export function canEnable(
  system: PowerSystemDef,
  systems: PowerSystemDef[],
  state: PowerSystemState,
  budgetKw: number,
  world: EventWorldState,
): boolean {
  if (isLocked(system, world)) return false;
  if (state[system.id] === "on") return true;
  return headroomKw(budgetKw, systems, state) >= system.consumptionKw;
}
