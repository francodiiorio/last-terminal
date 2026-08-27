import { CommandRegistry } from "@/core/commands/registry";
import { BASE_COMMANDS } from "@/game/commands/baseCommands";

export function createCommandRegistry(): CommandRegistry {
  const registry = new CommandRegistry();
  for (const command of BASE_COMMANDS) registry.register(command);
  return registry;
}
