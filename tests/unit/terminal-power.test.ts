import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/store";

describe("Terminal power (regression: toggling it off previously had no effect)", () => {
  beforeEach(() => {
    useGameStore.getState().newGame();
  });

  it("commands run normally while Terminal power is on", () => {
    useGameStore.getState().runCommand("status");
    const output = useGameStore.getState().terminal.output;
    expect(output.some((line) => line.text.includes("AION-7 -- STATION STATUS"))).toBe(true);
  });

  it("commands are refused once Terminal power is switched off", () => {
    useGameStore.getState().setPower("terminal", "off");
    useGameStore.getState().runCommand("status");
    const output = useGameStore.getState().terminal.output;
    const lastLine = output.at(-1);
    expect(lastLine?.text).toMatch(/TERMINAL OFFLINE/);
    expect(output.some((line) => line.text.includes("AION-7 -- STATION STATUS"))).toBe(false);
  });

  it("commands resume once Terminal power is switched back on", () => {
    useGameStore.getState().setPower("terminal", "off");
    useGameStore.getState().setPower("terminal", "on");
    useGameStore.getState().runCommand("status");
    const output = useGameStore.getState().terminal.output;
    expect(output.some((line) => line.text.includes("AION-7 -- STATION STATUS"))).toBe(true);
  });
});
