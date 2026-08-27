import type { Condition, EventWorldState } from "@/core/events/types";

export function evaluateCondition(condition: Condition, world: EventWorldState): boolean {
  switch (condition.type) {
    case "flag":
      return world.flags[condition.flag] === condition.equals;
    case "power":
      return world.power[condition.system] === condition.state;
    case "time": {
      const { minMinutes, maxMinutes } = condition;
      if (minMinutes !== undefined && world.minutesElapsed < minMinutes) return false;
      if (maxMinutes !== undefined && world.minutesElapsed > maxMinutes) return false;
      return true;
    }
    case "any":
      return condition.conditions.some((c) => evaluateCondition(c, world));
    case "not":
      return !evaluateCondition(condition.condition, world);
  }
}

/** Conditions on an event are an implicit AND. */
export function evaluateConditions(conditions: Condition[], world: EventWorldState): boolean {
  return conditions.every((c) => evaluateCondition(c, world));
}
