import type { PowerState } from "@/core/events/types";

export interface PowerSystemDef {
  id: string;
  name: string;
  consumptionKw: number;
  /** lower = more essential; used for display ordering only, not enforced by the engine */
  priority: number;
  defaultOn: boolean;
  /** if present, the system cannot be enabled at all and this message explains why (e.g. storm/cascade damage) */
  lockedReason?: string;
  description: string;
}

export type PowerSystemState = Record<string, PowerState>;
