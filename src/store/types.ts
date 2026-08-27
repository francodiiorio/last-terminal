import type { FlagValue, StoryFlags } from "@/core/flags";
import type { StoryState } from "@/store/story";
import type { PowerState } from "@/store/power";
import type { FilesystemState } from "@/store/filesystem";
import type { TerminalState } from "@/store/terminal";
import type { AppsState, WindowPosition } from "@/store/apps";
import type { TimeState } from "@/store/time";
import type { SettingsState } from "@/store/settings";
import type { StationState } from "@/store/station";
import type { PowerSystemState } from "@/game/power/types";
import type { Language } from "@/core/language";

/** The serializable subset of state a save game captures. Mirrors docs/ARCHITECTURE.md's SaveGameV1. */
export interface GameSnapshot {
  story: { flags: StoryFlags; firedOnceIds: string[]; endingId: string | null };
  power: { systems: PowerSystemState };
  filesystem: { cwd: string; unlockedIds: string[]; readIds: string[] };
  apps: { unlockedIds: string[] };
  terminal: { unlockedCommands: string[]; history: string[] };
  time: { minutesElapsed: number };
  settings: { volume: number; muted: boolean; reducedMotion: boolean };
}

export interface GameActions {
  bootComplete: () => void;
  setFlag: (flag: string, value: FlagValue) => void;
  setPower: (systemId: string, state: "on" | "off") => void;
  advanceTime: (minutes: number) => void;
  markFileRead: (fileId: string) => void;
  setCwd: (path: string) => void;
  runCommand: (input: string) => void;
  runEngineTickAction: () => void;

  openApp: (id: string) => void;
  closeApp: (id: string) => void;
  focusApp: (id: string) => void;
  moveApp: (id: string, position: WindowPosition) => void;

  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setLanguage: (language: Language) => void;
  dismissNotification: (id: string) => void;

  newGame: () => void;
  exportSnapshot: () => GameSnapshot;
  loadSnapshot: (snapshot: GameSnapshot) => void;
}

export interface GameState extends GameActions {
  story: StoryState;
  power: PowerState;
  filesystem: FilesystemState;
  terminal: TerminalState;
  apps: AppsState;
  time: TimeState;
  settings: SettingsState;
  station: StationState;
}
