export interface TerminalOutputLine {
  id: string;
  text: string;
  kind: "input" | "output" | "error";
}

export interface TerminalState {
  history: string[];
  output: TerminalOutputLine[];
  unlockedCommands: string[];
}

export const INITIAL_TERMINAL_STATE: TerminalState = {
  history: [],
  output: [],
  unlockedCommands: [],
};
