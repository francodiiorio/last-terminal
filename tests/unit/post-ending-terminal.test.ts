import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/store";

/**
 * Regression: EndingScreen's overlay blocks clicks but never moved keyboard focus off the
 * terminal input, and runCommand() never checked whether an ending had fired -- so a player
 * could keep typing commands that executed invisibly behind the "game over" modal. Fixed by
 * making runCommand() a no-op once story.endingId is set (EndingScreen.tsx separately moves
 * focus to its Restart button so there's nothing left focused behind the modal either).
 */
describe("terminal input after an ending has fired", () => {
  beforeEach(() => {
    useGameStore.getState().newGame();
  });

  it("runCommand does nothing once an ending has fired -- no output, no state change, not even an echo", () => {
    useGameStore.getState().runCommand("status");
    const outputBeforeEnding = useGameStore.getState().terminal.output.length;

    useGameStore.setState((s) => ({ story: { ...s.story, endingId: "silence" } }));

    useGameStore.getState().runCommand("power life-support off");

    expect(useGameStore.getState().terminal.output.length).toBe(outputBeforeEnding);
    expect(useGameStore.getState().power.systems["life-support"]).toBe("on");
  });

  it("runCommand still works normally before any ending has fired", () => {
    useGameStore.getState().runCommand("status");
    expect(useGameStore.getState().terminal.output.some((line) => line.text.includes("AION-7 -- STATION STATUS"))).toBe(true);
  });
});
