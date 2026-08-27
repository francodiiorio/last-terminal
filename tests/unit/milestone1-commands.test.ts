import { describe, expect, it } from "vitest";
import { createCommandRegistry } from "@/game/commands/registry";
import type { CommandContext, CommandDispatchAction, CommandGameStateView } from "@/core/commands/types";

function makeHarness(overrides: Partial<CommandGameStateView> = {}) {
  let state: CommandGameStateView = {
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
    unlockedCommands: [],
    unlockedFileIds: [],
    language: "en",
    minutesElapsed: 0,
    ...overrides,
  };

  const registry = createCommandRegistry();

  function dispatch(action: CommandDispatchAction) {
    switch (action.type) {
      case "setCwd":
        state = { ...state, cwd: action.path };
        break;
      case "setPower":
        state = { ...state, power: { ...state.power, [action.system]: action.state } };
        break;
      case "advanceTime":
        state = { ...state, minutesElapsed: state.minutesElapsed + action.minutes };
        break;
      case "markFileRead":
        state = { ...state, flags: { ...state.flags, [`read:${action.fileId}`]: true } };
        break;
      case "setFlag":
        state = { ...state, flags: { ...state.flags, [action.flag]: action.value } };
        break;
    }
  }

  function run(name: string, args: string[] = []) {
    const command = registry.get(name);
    if (!command) throw new Error(`no such command: ${name}`);
    const ctx: CommandContext = {
      args,
      raw: [name, ...args].join(" "),
      cwd: state.cwd,
      getState: () => state,
      dispatch,
    };
    return command.run(ctx);
  }

  return { run, getState: () => state };
}

describe("diagnostic + route: communications repair chain", () => {
  it("route fails without a diagnostic first", () => {
    const h = makeHarness();
    const result = h.run("route", ["communications"]);
    expect(result.output.join(" ")).toMatch(/no fault diagnosed/i);
    expect(h.getState().flags.communicationsRepaired).toBeUndefined();
  });

  it("diagnostic then route repairs the array and advances time", () => {
    const h = makeHarness();
    h.run("diagnostic", ["communications"]);
    expect(h.getState().flags.commsFaultDiagnosed).toBe(true);

    const before = h.getState().minutesElapsed;
    const result = h.run("route", ["communications"]);
    expect(h.getState().flags.communicationsRepaired).toBe(true);
    expect(h.getState().minutesElapsed).toBeGreaterThan(before);
    expect(result.output.join(" ")).toMatch(/REPAIRED/);
  });
});

describe("scan: laboratory unlock", () => {
  it("scanning laboratory sets the structural-clear flag", () => {
    const h = makeHarness();
    h.run("scan", ["laboratory"]);
    expect(h.getState().flags.labStructuralClear).toBe(true);
  });

  it("scanning an unrelated sector does not set the flag", () => {
    const h = makeHarness();
    h.run("scan", ["docking-bay"]);
    expect(h.getState().flags.labStructuralClear).toBeUndefined();
  });
});

describe("decrypt: encrypted archive file", () => {
  it("is denied while laboratory power is off", () => {
    const h = makeHarness();
    const result = h.run("decrypt", ["/archive/tantalus-survey.txt"]);
    expect(result.output.join(" ")).toMatch(/ACCESS DENIED/);
  });

  it("cat refuses an accessible but undecrypted file", () => {
    const h = makeHarness({
      power: { ...makeHarness().getState().power, laboratory: "on" },
    });
    const result = h.run("cat", ["/archive/tantalus-survey.txt"]);
    expect(result.output.join(" ")).toMatch(/FILE ENCRYPTED/);
  });

  it("decrypt then cat reveals the body", () => {
    const h = makeHarness({
      power: { ...makeHarness().getState().power, laboratory: "on" },
    });
    const decryptResult = h.run("decrypt", ["/archive/tantalus-survey.txt"]);
    expect(decryptResult.output.join(" ")).toMatch(/DECRYPTED/);
    expect(h.getState().flags["decrypted:tantalus-survey"]).toBe(true);

    const catResult = h.run("cat", ["/archive/tantalus-survey.txt"]);
    expect(catResult.output.join(" ")).toMatch(/TANTALUS/);
  });
});

describe("camera command", () => {
  it("is denied when Cameras power is off", () => {
    const h = makeHarness({ power: { ...makeHarness().getState().power, cameras: "off" } });
    const result = h.run("camera", ["sector-c"]);
    expect(result.output.join(" ")).toMatch(/ACCESS DENIED/);
  });

  it("viewing sector-c sets the viewedSectorCCamera flag and advances time", () => {
    const h = makeHarness();
    const before = h.getState().minutesElapsed;
    h.run("camera", ["sector-c"]);
    expect(h.getState().flags.viewedSectorCCamera).toBe(true);
    expect(h.getState().minutesElapsed).toBeGreaterThan(before);
  });
});
