import type { CommandContext, CommandDefinition, CommandResult } from "@/core/commands/types";
import type { EventWorldState } from "@/core/events/types";
import { evaluateConditions } from "@/core/conditions";
import { pick } from "@/core/language";
import { stringsFor, type Strings } from "@/i18n";
import { getNode, isAccessible, listChildren, resolvePath } from "@/game/filesystem/resolve";
import { canEnable, headroomKw, isLocked } from "@/game/power/budget";
import { FILESYSTEM_NODES } from "@content/files/tree";
import { POWER_SYSTEMS, STATION_POWER_BUDGET_KW } from "@content/power/systems";
import { CAMERA_FEEDS } from "@content/cameras/feeds";
import { TIME_COSTS, formatStationTime } from "@/core/time";

function worldFromCtx(ctx: CommandContext): EventWorldState {
  const state = ctx.getState();
  return { flags: state.flags, power: state.power, minutesElapsed: state.minutesElapsed };
}

function commandDescription(t: Strings, name: string): string {
  const entry = t.commands[name as keyof Strings["commands"]];
  return typeof entry === "object" ? entry.description : "";
}

const helpCommand: CommandDefinition = {
  name: "help",
  description: "List available commands.",
  usage: "help",
  unlockedByDefault: true,
  run: (ctx) => {
    const t = stringsFor(ctx.getState().language);
    const unlocked = new Set(ctx.getState().unlockedCommands);
    const lines = BASE_COMMANDS.filter((c) => c.unlockedByDefault || unlocked.has(c.name)).map(
      (c) => `  ${c.usage.padEnd(24)} ${commandDescription(t, c.name)}`,
    );
    return { output: [t.commands.help.header, ...lines] };
  },
};

const statusCommand: CommandDefinition = {
  name: "status",
  description: "Show station status summary.",
  usage: "status",
  unlockedByDefault: true,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    const onCount = POWER_SYSTEMS.filter((s) => state.power[s.id] === "on").length;
    const remaining = headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, state.power);
    return {
      output: [
        t.commands.status.header,
        t.commands.status.stationTime(formatStationTime(state.minutesElapsed)),
        t.commands.status.powerSystemsOn(onCount, POWER_SYSTEMS.length),
        t.commands.status.powerHeadroom(remaining),
        t.commands.status.footer,
      ],
    };
  },
};

const lsCommand: CommandDefinition = {
  name: "ls",
  description: "List directory contents.",
  usage: "ls [path]",
  unlockedByDefault: true,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    const target = ctx.args[0] ? resolvePath(state.cwd, ctx.args[0]) : state.cwd;
    const node = target === "/" ? { type: "dir" as const } : getNode(FILESYSTEM_NODES, target);
    if (!node || node.type !== "dir") {
      return { output: [t.commands.ls.notADirectory(target)] };
    }
    const world = worldFromCtx(ctx);
    const unlockedIds = new Set(state.unlockedFileIds);
    const children = listChildren(FILESYSTEM_NODES, target);
    if (children.length === 0) return { output: [t.commands.ls.empty(target)] };
    const lines = children.map((child) => {
      const accessible = isAccessible(child, world, unlockedIds);
      const tag = child.type === "dir" ? "/" : "";
      return accessible ? `  ${child.name}${tag}` : `  ${child.name}${tag}  ${t.commands.ls.lockedTag}`;
    });
    return { output: lines };
  },
};

const cdCommand: CommandDefinition = {
  name: "cd",
  description: "Change current directory.",
  usage: "cd <path>",
  unlockedByDefault: true,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    const path = ctx.args[0];
    if (!path) return { output: [t.commands.cd.usageError] };
    const target = resolvePath(state.cwd, path);
    if (target === "/") {
      ctx.dispatch({ type: "setCwd", path: target });
      return { output: [] };
    }
    const node = getNode(FILESYSTEM_NODES, target);
    if (!node || node.type !== "dir") {
      return { output: [t.commands.cd.noSuchDirectory(path)] };
    }
    ctx.dispatch({ type: "setCwd", path: target });
    return { output: [] };
  },
};

const catCommand: CommandDefinition = {
  name: "cat",
  description: "Read a file.",
  usage: "cat <path>",
  unlockedByDefault: true,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    const path = ctx.args[0];
    if (!path) return { output: [t.commands.cat.usageError] };
    const target = resolvePath(state.cwd, path);
    const node = getNode(FILESYSTEM_NODES, target);
    if (!node || node.type !== "file") {
      return { output: [t.commands.cat.noSuchFile(path)] };
    }
    const world = worldFromCtx(ctx);
    const unlockedIds = new Set(state.unlockedFileIds);
    if (!isAccessible(node, world, unlockedIds)) {
      return { output: [t.commands.cat.accessDenied(node.name)] };
    }
    if (node.encrypted && state.flags[`decrypted:${node.id}`] !== true) {
      return { output: [t.commands.cat.fileEncrypted(node.name, path)] };
    }
    ctx.dispatch({ type: "markFileRead", fileId: node.id });
    return { output: node.body ? pick(node.body, state.language) : [] };
  },
};

const clearCommand: CommandDefinition = {
  name: "clear",
  description: "Clear the terminal screen.",
  usage: "clear",
  unlockedByDefault: true,
  run: (): CommandResult => ({ output: [], clear: true }),
};

const powerCommand: CommandDefinition = {
  name: "power",
  description: "View or change power allocation.",
  usage: "power [system] [on|off]",
  unlockedByDefault: true,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    const world = worldFromCtx(ctx);
    const systemId = ctx.args[0]?.toLowerCase();
    const action = ctx.args[1]?.toLowerCase();

    if (!systemId) {
      const used = STATION_POWER_BUDGET_KW - headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, state.power);
      const lines = POWER_SYSTEMS.map((sys) => {
        const on = state.power[sys.id] === "on";
        const flag = isLocked(sys, world) ? t.power.locked : on ? `${t.power.on} ` : t.power.off;
        return `  ${sys.id.padEnd(16)} ${flag}  ${String(sys.consumptionKw).padStart(3)} kW`;
      });
      return {
        output: [t.commands.power.allocated(used, STATION_POWER_BUDGET_KW), ...lines],
      };
    }

    const system = POWER_SYSTEMS.find((s) => s.id === systemId);
    if (!system) return { output: [t.commands.power.unknownSystem(systemId)] };
    const name = pick(system.name, state.language);

    if (!action) {
      return { output: [t.commands.power.statusLine(name, state.power[system.id] === "on", system.consumptionKw)] };
    }
    if (action !== "on" && action !== "off") {
      return { output: [t.commands.power.usageError] };
    }
    if (action === "off") {
      ctx.dispatch({ type: "setPower", system: system.id, state: "off" });
      return { output: [t.commands.power.offline(name)] };
    }
    if (isLocked(system, world)) {
      const reason = system.lockedReason ? pick(system.lockedReason, state.language) : "";
      return { output: [t.commands.power.cannotEnable(name, reason)] };
    }
    if (!canEnable(system, POWER_SYSTEMS, state.power, STATION_POWER_BUDGET_KW, world)) {
      const remaining = headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, state.power);
      return {
        output: [
          t.commands.power.insufficientPower(name, system.consumptionKw, remaining),
          t.commands.power.freeUpHeadroom,
        ],
      };
    }
    ctx.dispatch({ type: "setPower", system: system.id, state: "on" });
    return { output: [t.commands.power.online(name)] };
  },
};

const whoamiCommand: CommandDefinition = {
  name: "whoami",
  description: "Show current user identity.",
  usage: "whoami",
  unlockedByDefault: true,
  run: (ctx) => ({ output: [stringsFor(ctx.getState().language).commands.whoami.identity] }),
};

const scanCommand: CommandDefinition = {
  name: "scan",
  description: "Run a structural/sensor sweep of a sector.",
  usage: "scan <sector>",
  unlockedByDefault: false,
  run: (ctx) => {
    const t = stringsFor(ctx.getState().language);
    const target = ctx.args[0]?.toLowerCase();
    if (!target) {
      return { output: [t.commands.scan.usageError, t.commands.scan.knownSectors] };
    }
    ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.scanSector });
    if (target === "laboratory" || target === "lab") {
      ctx.dispatch({ type: "setFlag", flag: "labStructuralClear", value: true });
      return { output: [t.commands.scan.labHeader, t.commands.scan.labResult] };
    }
    return { output: [t.commands.scan.genericHeader(target), t.commands.scan.genericResult] };
  },
};

const cameraCommand: CommandDefinition = {
  name: "camera",
  description: "View a camera feed.",
  usage: "camera [feed]",
  unlockedByDefault: false,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    const feedId = ctx.args[0]?.toLowerCase();
    if (!feedId) {
      return {
        output: [
          t.commands.camera.availableFeeds,
          ...CAMERA_FEEDS.map((f) => `  ${f.id.padEnd(17)} ${pick(f.name, state.language)}`),
        ],
      };
    }
    const feed = CAMERA_FEEDS.find((f) => f.id === feedId);
    if (!feed) return { output: [t.commands.camera.unknownFeed(feedId)] };
    const world = worldFromCtx(ctx);
    if (!evaluateConditions(feed.requires, world)) {
      return { output: [t.commands.camera.accessDenied(pick(feed.name, state.language))] };
    }
    ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.openCamera });
    if (feed.id === "sector-c") {
      ctx.dispatch({ type: "setFlag", flag: "viewedSectorCCamera", value: true });
    }
    return { output: pick(feed.body, state.language) };
  },
};

const decryptCommand: CommandDefinition = {
  name: "decrypt",
  description: "Decrypt an encrypted file.",
  usage: "decrypt <path>",
  unlockedByDefault: false,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    const path = ctx.args[0];
    if (!path) return { output: [t.commands.decrypt.usageError] };
    const target = resolvePath(state.cwd, path);
    const node = getNode(FILESYSTEM_NODES, target);
    if (!node || node.type !== "file") return { output: [t.commands.decrypt.noSuchFile(path)] };
    const world = worldFromCtx(ctx);
    const unlockedIds = new Set(state.unlockedFileIds);
    if (!isAccessible(node, world, unlockedIds)) {
      return { output: [t.commands.decrypt.accessDenied(node.name)] };
    }
    if (!node.encrypted) return { output: [t.commands.decrypt.notEncrypted(node.name)] };
    if (state.flags[`decrypted:${node.id}`] === true) return { output: [t.commands.decrypt.alreadyDecrypted(node.name)] };
    ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.decryptFile });
    ctx.dispatch({ type: "setFlag", flag: `decrypted:${node.id}`, value: true });
    return { output: [t.commands.decrypt.decrypted(node.name), t.commands.decrypt.runCatHint] };
  },
};

const routeCommand: CommandDefinition = {
  name: "route",
  description: "Reroute auxiliary power to repair a system.",
  usage: "route <system>",
  unlockedByDefault: false,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    const target = ctx.args[0]?.toLowerCase();
    if (!target) return { output: [t.commands.route.usageError] };
    if (target === "communications") {
      if (state.flags.commsFaultDiagnosed !== true) {
        return { output: [t.commands.route.noFaultDiagnosed, t.commands.route.diagnoseFirst] };
      }
      if (state.flags.communicationsRepaired === true) {
        return { output: [t.commands.route.alreadyRepaired] };
      }
      ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.reroutePower });
      ctx.dispatch({ type: "setFlag", flag: "communicationsRepaired", value: true });
      return { output: [t.commands.route.repaired, t.commands.route.availableForAllocation] };
    }
    return { output: [t.commands.route.noProcedure(target)] };
  },
};

const diagnosticCommand: CommandDefinition = {
  name: "diagnostic",
  description: "Run a systems diagnostic.",
  usage: "diagnostic [system]",
  unlockedByDefault: false,
  run: (ctx) => {
    const t = stringsFor(ctx.getState().language);
    const target = ctx.args[0]?.toLowerCase();
    ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.runDiagnostic });
    if (!target) return { output: [t.commands.diagnostic.stationWideHeader, t.commands.diagnostic.stationWideResult] };
    if (target === "communications") {
      ctx.dispatch({ type: "setFlag", flag: "commsFaultDiagnosed", value: true });
      return {
        output: [t.commands.diagnostic.commsHeader, t.commands.diagnostic.commsFault, t.commands.diagnostic.commsHint],
      };
    }
    return { output: [t.commands.diagnostic.genericHeader(target), t.commands.diagnostic.genericResult] };
  },
};

const concludeCommand: CommandDefinition = {
  name: "conclude",
  description: "Close out the session and compile the final record.",
  usage: "conclude",
  unlockedByDefault: false,
  run: (ctx) => {
    const state = ctx.getState();
    const t = stringsFor(state.language);
    if (state.flags.sessionConcluding === true) {
      return { output: [t.commands.conclude.alreadyConcluding] };
    }
    ctx.dispatch({ type: "setFlag", flag: "sessionConcluding", value: true });
    return { output: [t.commands.conclude.concluding, t.commands.conclude.compiling] };
  },
};

export const BASE_COMMANDS: CommandDefinition[] = [
  helpCommand,
  statusCommand,
  lsCommand,
  cdCommand,
  catCommand,
  clearCommand,
  powerCommand,
  whoamiCommand,
  scanCommand,
  cameraCommand,
  decryptCommand,
  routeCommand,
  diagnosticCommand,
  concludeCommand,
];
