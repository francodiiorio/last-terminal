import { describe, expect, it } from "vitest";
import { createCommandRegistry } from "@/game/commands/registry";
import type { CommandContext, CommandGameStateView } from "@/core/commands/types";

function makeState(overrides: Partial<CommandGameStateView> = {}): CommandGameStateView {
  return {
    flags: {},
    power: {
      "life-support": "on",
      terminal: "on",
      cameras: "on",
      security: "off",
      communications: "off",
      laboratory: "off",
      navigation: "off",
    },
    cwd: "/",
    unlockedCommands: ["camera"],
    unlockedFileIds: [],
    whoami: "REYES",
    minutesElapsed: 0,
    ...overrides,
  };
}

function run(name: string, args: string[] = []) {
  const registry = createCommandRegistry();
  const command = registry.get(name);
  if (!command) throw new Error(`no such command: ${name}`);
  const state = makeState();
  const ctx: CommandContext = {
    args,
    raw: [name, ...args].join(" "),
    cwd: state.cwd,
    getState: () => state,
    dispatch: () => {},
  };
  return command.run(ctx);
}

/** The column right after each row's left-padded id/label should start at the same index. */
function columnStart(line: string): number {
  const match = /^ {2}\S+( +)/.exec(line);
  if (!match) throw new Error(`line has no left-padded column: "${line}"`);
  return match[0].length;
}

describe("power command output alignment (regression: 'communications' broke padEnd(14))", () => {
  it("every system row's status flag starts in the same column, including the longest id", () => {
    const result = run("power");
    const rows = result.output.filter((line) => /^ {2}\S/.test(line));
    expect(rows.length).toBeGreaterThan(0);
    const columns = rows.map(columnStart);
    expect(new Set(columns).size).toBe(1);
    // sanity: "communications" (14 chars) must not be the row that breaks the pattern
    const commsRow = rows.find((r) => r.includes("communications"));
    expect(commsRow).toBeDefined();
  });
});

describe("camera feed list alignment (regression: 'engineering-bay' broke padEnd(14))", () => {
  it("every feed row's name starts in the same column, including the longest feed id", () => {
    const result = run("camera");
    const rows = result.output.filter((line) => /^ {2}\S/.test(line));
    expect(rows.length).toBeGreaterThan(0);
    const columns = rows.map(columnStart);
    expect(new Set(columns).size).toBe(1);
    const longRow = rows.find((r) => r.includes("engineering-bay"));
    expect(longRow).toBeDefined();
  });
});

describe("power command argument case-insensitivity (regression: only the command name was lowercased, not its args)", () => {
  it("accepts an uppercase system id", () => {
    const result = run("power", ["CAMERAS"]);
    expect(result.output.join(" ")).not.toMatch(/unknown system/);
    expect(result.output.join(" ")).toMatch(/Cameras/);
  });

  it("accepts an uppercase on/off action", () => {
    const result = run("power", ["cameras", "OFF"]);
    expect(result.output.join(" ")).toBe("Cameras: OFFLINE");
  });

  it("accepts fully uppercase system + action, matching scan/camera/route/diagnostic's case-insensitivity", () => {
    const result = run("power", ["CAMERAS", "OFF"]);
    expect(result.output.join(" ")).toBe("Cameras: OFFLINE");
  });
});
