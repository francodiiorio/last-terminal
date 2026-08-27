import type { PowerSystemState } from "@/game/power/types";
import { POWER_SYSTEMS } from "@content/power/systems";

export interface PowerState {
  systems: PowerSystemState;
}

export function buildInitialSystems(): PowerSystemState {
  const systems: PowerSystemState = {};
  for (const sys of POWER_SYSTEMS) {
    systems[sys.id] = sys.defaultOn && !sys.lockedReason ? "on" : "off";
  }
  return systems;
}

export const INITIAL_POWER_STATE: PowerState = {
  systems: buildInitialSystems(),
};
