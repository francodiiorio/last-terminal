import type { Condition, PowerState } from "@/core/events/types";

export interface PowerSystemDef {
  id: string;
  name: string;
  consumptionKw: number;
  /** lower = more essential; used for display ordering only, not enforced by the engine */
  priority: number;
  defaultOn: boolean;
  /** if present, the system starts locked and this message explains why (e.g. cascade damage) */
  lockedReason?: string;
  /**
   * If present alongside `lockedReason`, the system unlocks (becomes a normal toggle) once these
   * conditions hold -- typically flags set by a command sequence (see docs/GAME_DESIGN.md). If
   * `lockedReason` is set with no `unlockRequires`, the system is locked for the whole session.
   */
  unlockRequires?: Condition[];
  description: string;
}

export type PowerSystemState = Record<string, PowerState>;
