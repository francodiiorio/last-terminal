import { create } from "zustand";
import type { GameState, GameSnapshot } from "@/store/types";
import { INITIAL_STORY_STATE } from "@/store/story";
import { INITIAL_POWER_STATE, buildInitialSystems } from "@/store/power";
import { INITIAL_FILESYSTEM_STATE } from "@/store/filesystem";
import { INITIAL_TERMINAL_STATE, type TerminalOutputLine } from "@/store/terminal";
import { INITIAL_APPS_STATE, DEFAULT_UNLOCKED_APPS } from "@/store/apps";
import { INITIAL_TIME_STATE } from "@/store/time";
import { INITIAL_SETTINGS_STATE } from "@/store/settings";
import { INITIAL_STATION_STATE, type NotificationItem } from "@/store/station";
import { runEngineTick } from "@/game/engine";
import { audioManager } from "@/audio/manager";
import { parseCommandLine } from "@/core/commands/parser";
import type { CommandContext, CommandDispatchAction, CommandGameStateView } from "@/core/commands/types";
import { createCommandRegistry } from "@/game/commands/registry";
import { stringsFor } from "@/i18n";
import { loadStoredLanguage, storeLanguage } from "@/core/language";

const commandRegistry = createCommandRegistry();

function makeOutputLine(text: string, kind: TerminalOutputLine["kind"]): TerminalOutputLine {
  return { id: crypto.randomUUID(), text, kind };
}

function buildCommandStateView(state: GameState): CommandGameStateView {
  return {
    flags: state.story.flags,
    power: state.power.systems,
    cwd: state.filesystem.cwd,
    unlockedCommands: state.terminal.unlockedCommands,
    unlockedFileIds: state.filesystem.unlockedIds,
    language: state.settings.language,
    minutesElapsed: state.time.minutesElapsed,
  };
}

export const useGameStore = create<GameState>()((set, get) => {
  function handleDispatch(action: CommandDispatchAction) {
    switch (action.type) {
      case "setCwd":
        get().setCwd(action.path);
        break;
      case "setPower":
        get().setPower(action.system, action.state);
        break;
      case "advanceTime":
        get().advanceTime(action.minutes);
        break;
      case "markFileRead":
        get().markFileRead(action.fileId);
        break;
      case "setFlag":
        get().setFlag(action.flag, action.value);
        break;
    }
  }

  return {
    story: { ...INITIAL_STORY_STATE },
    power: { systems: { ...INITIAL_POWER_STATE.systems } },
    filesystem: { ...INITIAL_FILESYSTEM_STATE },
    terminal: { ...INITIAL_TERMINAL_STATE },
    apps: { ...INITIAL_APPS_STATE },
    time: { ...INITIAL_TIME_STATE },
    settings: { ...INITIAL_SETTINGS_STATE, language: loadStoredLanguage() },
    station: { ...INITIAL_STATION_STATE },

    bootComplete: () => {
      set((s) => ({ station: { ...s.station, scene: "desktop" }, story: { ...s.story, flags: { ...s.story.flags, wokeUp: true } } }));
      get().runEngineTickAction();
    },

    setFlag: (flag, value) => {
      set((s) => ({ story: { ...s.story, flags: { ...s.story.flags, [flag]: value } } }));
      get().runEngineTickAction();
    },

    setPower: (systemId, state) => {
      set((s) => ({ power: { systems: { ...s.power.systems, [systemId]: state } } }));
      get().runEngineTickAction();
    },

    advanceTime: (minutes) => {
      set((s) => ({ time: { minutesElapsed: s.time.minutesElapsed + minutes } }));
      get().runEngineTickAction();
    },

    markFileRead: (fileId) => {
      set((s) => ({
        filesystem: {
          ...s.filesystem,
          readIds: s.filesystem.readIds.includes(fileId) ? s.filesystem.readIds : [...s.filesystem.readIds, fileId],
        },
        story: { ...s.story, flags: { ...s.story.flags, [`read:${fileId}`]: true } },
      }));
      get().runEngineTickAction();
    },

    setCwd: (path) => set((s) => ({ filesystem: { ...s.filesystem, cwd: path } })),

    runEngineTickAction: () => {
      const s = get();
      const result = runEngineTick({
        flags: s.story.flags,
        power: s.power.systems,
        minutesElapsed: s.time.minutesElapsed,
        firedOnceIds: s.story.firedOnceIds,
        endingId: s.story.endingId,
      });

      const newNotifications: NotificationItem[] = result.notifications.map((n) => ({
        id: crypto.randomUUID(),
        message: n.message,
        level: n.level,
        createdAtMinutes: result.minutesElapsed,
      }));

      set((st) => ({
        story: { flags: result.flags, firedOnceIds: result.firedOnceIds, endingId: result.endingId },
        power: { systems: result.power },
        time: { minutesElapsed: result.minutesElapsed },
        station: {
          ...st.station,
          notifications: [...st.station.notifications, ...newNotifications].slice(-20),
        },
        filesystem: {
          ...st.filesystem,
          unlockedIds: Array.from(new Set([...st.filesystem.unlockedIds, ...result.unlockedFiles])),
        },
        apps: {
          ...st.apps,
          unlockedIds: Array.from(new Set([...st.apps.unlockedIds, ...result.unlockedApps])),
        },
        terminal: {
          ...st.terminal,
          unlockedCommands: Array.from(new Set([...st.terminal.unlockedCommands, ...result.unlockedCommands])),
        },
      }));
    },

    runCommand: (input) => {
      // Once an ending has fired, the session is over -- the terminal must stop being a live
      // control surface, even though the ending screen's overlay keeps keyboard focus on it
      // (it blocks clicks but never moves focus). No further input should be recorded or acted
      // on, not even echoed.
      if (get().story.endingId !== null) return;

      const cwdAtInput = get().filesystem.cwd;
      set((s) => ({
        terminal: {
          ...s.terminal,
          output: [...s.terminal.output, makeOutputLine(`${cwdAtInput} $ ${input}`, "input")],
          history: [...s.terminal.history, input],
        },
      }));

      const t = stringsFor(get().settings.language);

      if (get().power.systems.terminal === "off") {
        set((s) => ({
          terminal: {
            ...s.terminal,
            output: [...s.terminal.output, makeOutputLine(t.terminal.offlineMessage, "error")],
          },
        }));
        return;
      }

      const parsed = parseCommandLine(input);
      if (!parsed) return;

      const commandDef = commandRegistry.get(parsed.name);
      const unlockedSet = new Set(get().terminal.unlockedCommands);
      const available = commandDef && (commandDef.unlockedByDefault || unlockedSet.has(commandDef.name));

      if (!commandDef || !available) {
        set((s) => ({
          terminal: {
            ...s.terminal,
            output: [...s.terminal.output, makeOutputLine(t.commands.commandNotFound(parsed.name), "error")],
          },
        }));
        return;
      }

      const ctx: CommandContext = {
        args: parsed.args,
        raw: input,
        cwd: get().filesystem.cwd,
        getState: () => buildCommandStateView(get()),
        dispatch: handleDispatch,
      };

      const result = commandDef.run(ctx);

      if (result.clear) {
        set((s) => ({ terminal: { ...s.terminal, output: [] } }));
        return;
      }
      if (result.output.length > 0) {
        set((s) => ({
          terminal: {
            ...s.terminal,
            output: [...s.terminal.output, ...result.output.map((line) => makeOutputLine(line, "output"))],
          },
        }));
      }
    },

    openApp: (id) =>
      set((s) => ({
        apps: {
          ...s.apps,
          openIds: s.apps.openIds.includes(id) ? s.apps.openIds : [...s.apps.openIds, id],
          focusedId: id,
        },
      })),

    closeApp: (id) =>
      set((s) => ({
        apps: {
          ...s.apps,
          openIds: s.apps.openIds.filter((appId) => appId !== id),
          focusedId: s.apps.focusedId === id ? null : s.apps.focusedId,
        },
      })),

    focusApp: (id) => set((s) => ({ apps: { ...s.apps, focusedId: id } })),

    moveApp: (id, position) =>
      set((s) => ({ apps: { ...s.apps, positions: { ...s.apps.positions, [id]: position } } })),

    setVolume: (volume) => {
      set((s) => ({ settings: { ...s.settings, volume } }));
      audioManager.setMasterVolume(volume);
    },
    setMuted: (muted) => {
      set((s) => ({ settings: { ...s.settings, muted } }));
      audioManager.setMuted(muted);
    },
    setReducedMotion: (value) => set((s) => ({ settings: { ...s.settings, reducedMotion: value } })),
    setLanguage: (language) => {
      set((s) => ({ settings: { ...s.settings, language } }));
      storeLanguage(language);
    },
    dismissNotification: (id) =>
      set((s) => ({ station: { ...s.station, notifications: s.station.notifications.filter((n) => n.id !== id) } })),

    newGame: () => {
      set(() => ({
        story: { ...INITIAL_STORY_STATE, flags: {}, firedOnceIds: [], endingId: null },
        power: { systems: buildInitialSystems() },
        filesystem: { ...INITIAL_FILESYSTEM_STATE },
        terminal: { ...INITIAL_TERMINAL_STATE, output: [], history: [], unlockedCommands: [] },
        apps: { ...INITIAL_APPS_STATE, unlockedIds: [...DEFAULT_UNLOCKED_APPS], openIds: [], positions: {} },
        time: { ...INITIAL_TIME_STATE },
        station: { scene: "boot", notifications: [] },
      }));
    },

    exportSnapshot: (): GameSnapshot => {
      const s = get();
      return {
        story: { flags: s.story.flags, firedOnceIds: s.story.firedOnceIds, endingId: s.story.endingId },
        power: { systems: s.power.systems },
        filesystem: { cwd: s.filesystem.cwd, unlockedIds: s.filesystem.unlockedIds, readIds: s.filesystem.readIds },
        apps: { unlockedIds: s.apps.unlockedIds },
        terminal: { unlockedCommands: s.terminal.unlockedCommands, history: s.terminal.history },
        time: { minutesElapsed: s.time.minutesElapsed },
        settings: { volume: s.settings.volume, muted: s.settings.muted, reducedMotion: s.settings.reducedMotion },
      };
    },

    loadSnapshot: (snapshot: GameSnapshot) => {
      set((s) => ({
        story: { flags: snapshot.story.flags, firedOnceIds: snapshot.story.firedOnceIds, endingId: snapshot.story.endingId },
        power: { systems: snapshot.power.systems },
        filesystem: {
          cwd: snapshot.filesystem.cwd,
          unlockedIds: snapshot.filesystem.unlockedIds,
          readIds: snapshot.filesystem.readIds,
        },
        apps: { ...s.apps, unlockedIds: snapshot.apps.unlockedIds },
        terminal: { ...s.terminal, unlockedCommands: snapshot.terminal.unlockedCommands, history: snapshot.terminal.history, output: [] },
        time: { minutesElapsed: snapshot.time.minutesElapsed },
        // language is a standalone localStorage preference (src/core/language.ts), not part of
        // the snapshot -- loading a save must not change it.
        settings: {
          ...s.settings,
          volume: snapshot.settings.volume,
          muted: snapshot.settings.muted,
          reducedMotion: snapshot.settings.reducedMotion,
        },
        station: { scene: "desktop", notifications: [] },
      }));
      audioManager.setMasterVolume(snapshot.settings.volume);
      audioManager.setMuted(snapshot.settings.muted);
    },
  };
});
