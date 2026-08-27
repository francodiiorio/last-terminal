import { runEventCheck } from "@/core/events/engine";
import type { EventWorldState, NotificationLevel } from "@/core/events/types";
import type { StoryFlags } from "@/core/flags";
import type { PowerSystemState } from "@/game/power/types";
import { ALL_EVENTS } from "@content/events";

export interface EngineSnapshot {
  flags: StoryFlags;
  power: PowerSystemState;
  minutesElapsed: number;
  firedOnceIds: string[];
  endingId: string | null;
}

export interface EngineTickResult {
  flags: StoryFlags;
  power: PowerSystemState;
  minutesElapsed: number;
  firedOnceIds: string[];
  notifications: Array<{ message: string; level: NotificationLevel }>;
  unlockedFiles: string[];
  unlockedApps: string[];
  unlockedCommands: string[];
  endingId: string | null;
}

const MAX_PASSES = 10;

/**
 * Runs the event engine to a fixed point against a plain state snapshot. Deliberately free of
 * Zustand/React so it stays unit-testable as plain data in, data out. Call after any mutation
 * that could affect event conditions (flag/power/time change).
 */
export function runEngineTick(snapshot: EngineSnapshot): EngineTickResult {
  let flags = { ...snapshot.flags };
  let power = { ...snapshot.power };
  let minutesElapsed = snapshot.minutesElapsed;
  let firedOnceIds = [...snapshot.firedOnceIds];
  let endingId = snapshot.endingId;
  const notifications: EngineTickResult["notifications"] = [];
  const unlockedFiles: string[] = [];
  const unlockedApps: string[] = [];
  const unlockedCommands: string[] = [];

  // Once an ending has landed, the session is over -- don't keep evaluating events against it.
  if (endingId === null) {
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      const world: EventWorldState = { flags, power, minutesElapsed };
      const { effects, newlyFiredOnceIds } = runEventCheck(ALL_EVENTS, world, new Set(firedOnceIds));

      for (const { flag, value } of effects.setFlags) flags[flag] = value;
      for (const { system, state } of effects.setPower) power[system] = state;
      minutesElapsed += effects.minutesAdvanced;
      firedOnceIds = [...firedOnceIds, ...newlyFiredOnceIds];
      notifications.push(...effects.notifications);
      unlockedFiles.push(...effects.unlockedFiles);
      unlockedApps.push(...effects.unlockedApps);
      unlockedCommands.push(...effects.unlockedCommands);
      if (effects.endingId !== null) endingId = effects.endingId;

      if (newlyFiredOnceIds.length === 0 || endingId !== null) break;
    }
  }

  return {
    flags,
    power,
    minutesElapsed,
    firedOnceIds,
    notifications,
    unlockedFiles,
    unlockedApps,
    unlockedCommands,
    endingId,
  };
}
