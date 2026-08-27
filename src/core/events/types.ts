import type { FlagValue } from "@/core/flags";

export type PowerState = "on" | "off";
export type NotificationLevel = "info" | "warning" | "critical";

export type Condition =
  | { type: "flag"; flag: string; equals: FlagValue }
  | { type: "power"; system: string; state: PowerState }
  | { type: "time"; minMinutes?: number; maxMinutes?: number }
  | { type: "any"; conditions: Condition[] }
  | { type: "not"; condition: Condition };

export type Action =
  | { type: "setFlag"; flag: string; value: FlagValue }
  | { type: "notification"; message: string; level?: NotificationLevel }
  | { type: "unlockFile"; fileId: string }
  | { type: "unlockApp"; appId: string }
  | { type: "unlockCommand"; command: string }
  | { type: "setPower"; system: string; state: PowerState }
  | { type: "deliverMessage"; messageId: string }
  | { type: "advanceTime"; minutes: number };

export interface GameEvent {
  id: string;
  once: boolean;
  conditions: Condition[];
  actions: Action[];
}

/** The subset of world state the event engine needs to evaluate conditions. Kept minimal and store-agnostic. */
export interface EventWorldState {
  flags: Record<string, FlagValue>;
  power: Record<string, PowerState>;
  minutesElapsed: number;
}

export interface EventEffects {
  setFlags: Array<{ flag: string; value: FlagValue }>;
  notifications: Array<{ message: string; level: NotificationLevel }>;
  unlockedFiles: string[];
  unlockedApps: string[];
  unlockedCommands: string[];
  setPower: Array<{ system: string; state: PowerState }>;
  deliveredMessages: string[];
  minutesAdvanced: number;
}

export function createEmptyEffects(): EventEffects {
  return {
    setFlags: [],
    notifications: [],
    unlockedFiles: [],
    unlockedApps: [],
    unlockedCommands: [],
    setPower: [],
    deliveredMessages: [],
    minutesAdvanced: 0,
  };
}
