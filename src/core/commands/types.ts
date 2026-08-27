import type { Language } from "@/core/language";

export interface CommandContext {
  args: string[];
  raw: string;
  cwd: string;
  getState: () => CommandGameStateView;
  dispatch: (action: CommandDispatchAction) => void;
}

/** Read-only slice of game state a command needs. Deliberately narrow. */
export interface CommandGameStateView {
  flags: Record<string, boolean | number | string>;
  power: Record<string, "on" | "off">;
  cwd: string;
  unlockedCommands: string[];
  unlockedFileIds: string[];
  language: Language;
  minutesElapsed: number;
}

export type CommandDispatchAction =
  | { type: "setCwd"; path: string }
  | { type: "setPower"; system: string; state: "on" | "off" }
  | { type: "advanceTime"; minutes: number }
  | { type: "markFileRead"; fileId: string }
  | { type: "setFlag"; flag: string; value: boolean | number | string };

export interface CommandResult {
  output: string[];
  /** UI directive: clear the terminal scrollback instead of appending output. */
  clear?: boolean;
}

export interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  unlockedByDefault: boolean;
  run: (ctx: CommandContext) => CommandResult;
}
