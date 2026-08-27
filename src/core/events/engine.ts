import type { EventEffects, EventWorldState, GameEvent } from "@/core/events/types";
import { createEmptyEffects } from "@/core/events/types";
import { evaluateConditions } from "@/core/conditions";
import { applyActions } from "@/core/events/actions";

export interface EventCheckResult {
  effects: EventEffects;
  /** ids of `once` events that fired this pass and must be recorded so they never fire again */
  newlyFiredOnceIds: string[];
}

/**
 * Scans all events against the current world state. Fires every satisfied event that is
 * either repeatable or `once` and not already in `firedOnceIds`. Call this after any
 * state-changing action that could affect conditions (flag/power/time change) — it is not
 * a polling loop.
 */
export function runEventCheck(
  events: GameEvent[],
  world: EventWorldState,
  firedOnceIds: ReadonlySet<string>,
): EventCheckResult {
  const effects = createEmptyEffects();
  const newlyFiredOnceIds: string[] = [];

  for (const event of events) {
    if (event.once && firedOnceIds.has(event.id)) continue;
    if (!evaluateConditions(event.conditions, world)) continue;

    applyActions(event.actions, effects);
    if (event.once) newlyFiredOnceIds.push(event.id);
  }

  return { effects, newlyFiredOnceIds };
}
