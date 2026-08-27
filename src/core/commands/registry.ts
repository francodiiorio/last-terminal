import type { CommandDefinition } from "@/core/commands/types";

export class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();

  register(command: CommandDefinition): void {
    this.commands.set(command.name, command);
  }

  get(name: string): CommandDefinition | undefined {
    return this.commands.get(name);
  }

  all(): CommandDefinition[] {
    return [...this.commands.values()];
  }
}
