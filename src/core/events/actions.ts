import type { Action, EventEffects } from "@/core/events/types";
import { createEmptyEffects } from "@/core/events/types";

/**
 * Reduces a list of actions into a single EventEffects payload the store layer applies.
 * Pure function: does not touch any store or global state directly.
 */
export function applyActions(actions: Action[], into: EventEffects = createEmptyEffects()): EventEffects {
  for (const action of actions) {
    switch (action.type) {
      case "setFlag":
        into.setFlags.push({ flag: action.flag, value: action.value });
        break;
      case "notification":
        into.notifications.push({ message: action.message, level: action.level ?? "info" });
        break;
      case "unlockFile":
        into.unlockedFiles.push(action.fileId);
        break;
      case "unlockApp":
        into.unlockedApps.push(action.appId);
        break;
      case "unlockCommand":
        into.unlockedCommands.push(action.command);
        break;
      case "setPower":
        into.setPower.push({ system: action.system, state: action.state });
        break;
      case "deliverMessage":
        into.deliveredMessages.push(action.messageId);
        break;
      case "advanceTime":
        into.minutesAdvanced += action.minutes;
        break;
      case "ending":
        into.endingId = action.endingId;
        break;
    }
  }
  return into;
}
