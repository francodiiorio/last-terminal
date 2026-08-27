import type { CommandContext, CommandDefinition, CommandResult } from "@/core/commands/types";
import type { EventWorldState } from "@/core/events/types";
import { getNode, isAccessible, listChildren, resolvePath } from "@/game/filesystem/resolve";
import { canEnable, headroomKw } from "@/game/power/budget";
import { FILESYSTEM_NODES } from "@content/files/tree";
import { POWER_SYSTEMS, STATION_POWER_BUDGET_KW } from "@content/power/systems";
import { formatStationTime } from "@/core/time";

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
      .map((c) => `  ${c.usage.padEnd(16)} ${c.description}`);
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
    const [systemId, action] = ctx.args;

    if (!systemId) {
      const used = STATION_POWER_BUDGET_KW - headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, state.power);
      const lines = POWER_SYSTEMS.map((sys) => {
        const on = state.power[sys.id] === "on";
        const flag = sys.lockedReason ? "LOCKED" : on ? "ON " : "OFF";
        return `  ${sys.id.padEnd(14)} ${flag}  ${String(sys.consumptionKw).padStart(3)} kW`;
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
    if (system.lockedReason) {
      return { output: [`${system.name}: CANNOT ENABLE -- ${system.lockedReason}`] };
    }
    if (!canEnable(system, POWER_SYSTEMS, state.power, STATION_POWER_BUDGET_KW)) {
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

export const BASE_COMMANDS: CommandDefinition[] = [
  helpCommand,
  statusCommand,
  lsCommand,
  cdCommand,
  catCommand,
  clearCommand,
  powerCommand,
  whoamiCommand,
];
