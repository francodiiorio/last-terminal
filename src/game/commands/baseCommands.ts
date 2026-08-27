import type { CommandContext, CommandDefinition, CommandResult } from "@/core/commands/types";
import type { EventWorldState } from "@/core/events/types";
import { evaluateConditions } from "@/core/conditions";
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

const helpCommand: CommandDefinition = {
  name: "help",
  description: "List available commands.",
  usage: "help",
  unlockedByDefault: true,
  run: (ctx) => {
    const unlocked = new Set(ctx.getState().unlockedCommands);
    const lines = BASE_COMMANDS.filter((c) => c.unlockedByDefault || unlocked.has(c.name))
      .map((c) => `  ${c.usage.padEnd(24)} ${c.description}`);
    return { output: ["AVAILABLE COMMANDS:", ...lines] };
  },
};

const statusCommand: CommandDefinition = {
  name: "status",
  description: "Show station status summary.",
  usage: "status",
  unlockedByDefault: true,
  run: (ctx) => {
    const state = ctx.getState();
    const onCount = POWER_SYSTEMS.filter((s) => state.power[s.id] === "on").length;
    const remaining = headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, state.power);
    return {
      output: [
        "AION-7 -- STATION STATUS",
        `  Station time:     ${formatStationTime(state.minutesElapsed)}`,
        `  Power systems on: ${onCount}/${POWER_SYSTEMS.length}`,
        `  Power headroom:   ${remaining} kW`,
        "  Reserve power engaged. See 'power' for allocation.",
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
    const target = ctx.args[0] ? resolvePath(state.cwd, ctx.args[0]) : state.cwd;
    const node = target === "/" ? { type: "dir" as const } : getNode(FILESYSTEM_NODES, target);
    if (!node || node.type !== "dir") {
      return { output: [`ls: not a directory: ${target}`] };
    }
    const world = worldFromCtx(ctx);
    const unlockedIds = new Set(state.unlockedFileIds);
    const children = listChildren(FILESYSTEM_NODES, target);
    if (children.length === 0) return { output: [`${target}: (empty)`] };
    const lines = children.map((child) => {
      const accessible = isAccessible(child, world, unlockedIds);
      const tag = child.type === "dir" ? "/" : "";
      return accessible ? `  ${child.name}${tag}` : `  ${child.name}${tag}  [LOCKED]`;
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
    const path = ctx.args[0];
    if (!path) return { output: ["usage: cd <path>"] };
    const target = resolvePath(state.cwd, path);
    if (target === "/") {
      ctx.dispatch({ type: "setCwd", path: target });
      return { output: [] };
    }
    const node = getNode(FILESYSTEM_NODES, target);
    if (!node || node.type !== "dir") {
      return { output: [`cd: no such directory: ${path}`] };
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
    const path = ctx.args[0];
    if (!path) return { output: ["usage: cat <path>"] };
    const target = resolvePath(state.cwd, path);
    const node = getNode(FILESYSTEM_NODES, target);
    if (!node || node.type !== "file") {
      return { output: [`cat: no such file: ${path}`] };
    }
    const world = worldFromCtx(ctx);
    const unlockedIds = new Set(state.unlockedFileIds);
    if (!isAccessible(node, world, unlockedIds)) {
      return { output: [`ACCESS DENIED: ${node.name} -- insufficient clearance or system offline`] };
    }
    if (node.encrypted && state.flags[`decrypted:${node.id}`] !== true) {
      return { output: [`FILE ENCRYPTED: ${node.name} -- run 'decrypt ${path}' first.`] };
    }
    ctx.dispatch({ type: "markFileRead", fileId: node.id });
    return { output: node.body ?? [] };
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
    const world = worldFromCtx(ctx);
    const systemId = ctx.args[0]?.toLowerCase();
    const action = ctx.args[1]?.toLowerCase();

    if (!systemId) {
      const used = STATION_POWER_BUDGET_KW - headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, state.power);
      const lines = POWER_SYSTEMS.map((sys) => {
        const on = state.power[sys.id] === "on";
        const flag = isLocked(sys, world) ? "LOCKED" : on ? "ON " : "OFF";
        return `  ${sys.id.padEnd(16)} ${flag}  ${String(sys.consumptionKw).padStart(3)} kW`;
      });
      return {
        output: [
          `POWER -- ${used}/${STATION_POWER_BUDGET_KW} kW allocated`,
          ...lines,
        ],
      };
    }

    const system = POWER_SYSTEMS.find((s) => s.id === systemId);
    if (!system) return { output: [`power: unknown system: ${systemId}`] };

    if (!action) {
      return { output: [`${system.name}: ${state.power[system.id] === "on" ? "ON" : "OFF"} (${system.consumptionKw} kW)`] };
    }
    if (action !== "on" && action !== "off") {
      return { output: ["usage: power <system> <on|off>"] };
    }
    if (action === "off") {
      ctx.dispatch({ type: "setPower", system: system.id, state: "off" });
      return { output: [`${system.name}: OFFLINE`] };
    }
    if (isLocked(system, world)) {
      return { output: [`${system.name}: CANNOT ENABLE -- ${system.lockedReason}`] };
    }
    if (!canEnable(system, POWER_SYSTEMS, state.power, STATION_POWER_BUDGET_KW, world)) {
      const remaining = headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, state.power);
      return {
        output: [
          `${system.name}: INSUFFICIENT POWER -- requires ${system.consumptionKw} kW, ${remaining} kW available.`,
          "Disable another system to free up headroom.",
        ],
      };
    }
    ctx.dispatch({ type: "setPower", system: system.id, state: "on" });
    return { output: [`${system.name}: ONLINE`] };
  },
};

const whoamiCommand: CommandDefinition = {
  name: "whoami",
  description: "Show current user identity.",
  usage: "whoami",
  unlockedByDefault: true,
  run: (ctx) => ({ output: [ctx.getState().whoami] }),
};

const scanCommand: CommandDefinition = {
  name: "scan",
  description: "Run a structural/sensor sweep of a sector.",
  usage: "scan <sector>",
  unlockedByDefault: false,
  run: (ctx) => {
    const target = ctx.args[0]?.toLowerCase();
    if (!target) {
      return {
        output: [
          "usage: scan <sector>",
          "Known sectors: system, crew, engineering, security, communications, laboratory, archive",
        ],
      };
    }
    ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.scanSector });
    if (target === "laboratory" || target === "lab") {
      ctx.dispatch({ type: "setFlag", flag: "labStructuralClear", value: true });
      return {
        output: [
          "STRUCTURAL SCAN -- LABORATORY",
          "Seal integrity within tolerance. Sector cleared for power restoration.",
        ],
      };
    }
    return { output: [`STRUCTURAL SCAN -- ${target.toUpperCase()}`, "No anomalies detected."] };
  },
};

const cameraCommand: CommandDefinition = {
  name: "camera",
  description: "View a camera feed.",
  usage: "camera [feed]",
  unlockedByDefault: false,
  run: (ctx) => {
    const feedId = ctx.args[0]?.toLowerCase();
    if (!feedId) {
      return { output: ["AVAILABLE FEEDS:", ...CAMERA_FEEDS.map((f) => `  ${f.id.padEnd(17)} ${f.name}`)] };
    }
    const feed = CAMERA_FEEDS.find((f) => f.id === feedId);
    if (!feed) return { output: [`camera: unknown feed: ${feedId}`] };
    const world = worldFromCtx(ctx);
    if (!evaluateConditions(feed.requires, world)) {
      return { output: [`ACCESS DENIED: ${feed.name} -- camera grid offline`] };
    }
    ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.openCamera });
    if (feed.id === "sector-c") {
      ctx.dispatch({ type: "setFlag", flag: "viewedSectorCCamera", value: true });
    }
    return { output: feed.body };
  },
};

const decryptCommand: CommandDefinition = {
  name: "decrypt",
  description: "Decrypt an encrypted file.",
  usage: "decrypt <path>",
  unlockedByDefault: false,
  run: (ctx) => {
    const state = ctx.getState();
    const path = ctx.args[0];
    if (!path) return { output: ["usage: decrypt <path>"] };
    const target = resolvePath(state.cwd, path);
    const node = getNode(FILESYSTEM_NODES, target);
    if (!node || node.type !== "file") return { output: [`decrypt: no such file: ${path}`] };
    const world = worldFromCtx(ctx);
    const unlockedIds = new Set(state.unlockedFileIds);
    if (!isAccessible(node, world, unlockedIds)) {
      return { output: [`ACCESS DENIED: ${node.name} -- insufficient clearance or system offline`] };
    }
    if (!node.encrypted) return { output: [`${node.name}: not encrypted.`] };
    if (state.flags[`decrypted:${node.id}`] === true) return { output: [`${node.name}: already decrypted.`] };
    ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.decryptFile });
    ctx.dispatch({ type: "setFlag", flag: `decrypted:${node.id}`, value: true });
    return { output: [`${node.name}: DECRYPTED.`, "Run 'cat' to read it."] };
  },
};

const routeCommand: CommandDefinition = {
  name: "route",
  description: "Reroute auxiliary power to repair a system.",
  usage: "route <system>",
  unlockedByDefault: false,
  run: (ctx) => {
    const state = ctx.getState();
    const target = ctx.args[0]?.toLowerCase();
    if (!target) return { output: ["usage: route <system>"] };
    if (target === "communications") {
      if (state.flags.commsFaultDiagnosed !== true) {
        return { output: ["ROUTE FAILED -- no fault diagnosed.", "Run 'diagnostic communications' first."] };
      }
      if (state.flags.communicationsRepaired === true) {
        return { output: ["Communications array: already repaired."] };
      }
      ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.reroutePower });
      ctx.dispatch({ type: "setFlag", flag: "communicationsRepaired", value: true });
      return {
        output: ["AUXILIARY POWER REROUTED -- COMMUNICATIONS ARRAY REPAIRED.", "System available for power allocation."],
      };
    }
    return { output: [`route: no repair procedure for '${target}'.`] };
  },
};

const diagnosticCommand: CommandDefinition = {
  name: "diagnostic",
  description: "Run a systems diagnostic.",
  usage: "diagnostic [system]",
  unlockedByDefault: false,
  run: (ctx) => {
    const target = ctx.args[0]?.toLowerCase();
    ctx.dispatch({ type: "advanceTime", minutes: TIME_COSTS.runDiagnostic });
    if (!target) return { output: ["DIAGNOSTIC -- STATION-WIDE", "No critical faults outside known incidents."] };
    if (target === "communications") {
      ctx.dispatch({ type: "setFlag", flag: "commsFaultDiagnosed", value: true });
      return {
        output: [
          "DIAGNOSTIC -- COMMUNICATIONS ARRAY",
          "Fault isolated: primary coupling sheared during the Cascade.",
          "Auxiliary reroute should restore power delivery. See 'route communications'.",
        ],
      };
    }
    return { output: [`DIAGNOSTIC -- ${target.toUpperCase()}`, "No faults detected."] };
  },
};

const concludeCommand: CommandDefinition = {
  name: "conclude",
  description: "Close out the session and compile the final record.",
  usage: "conclude",
  unlockedByDefault: false,
  run: (ctx) => {
    const state = ctx.getState();
    if (state.flags.sessionConcluding === true) {
      return { output: ["Session already concluding. Awaiting resolution."] };
    }
    ctx.dispatch({ type: "setFlag", flag: "sessionConcluding", value: true });
    return { output: ["CONCLUDING SESSION...", "Compiling final record."] };
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
