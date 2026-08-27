import { describe, expect, it } from "vitest";
import { parseCommandLine } from "@/core/commands/parser";

describe("parseCommandLine", () => {
  it("returns null for empty input", () => {
    expect(parseCommandLine("")).toBeNull();
    expect(parseCommandLine("   ")).toBeNull();
  });

  it("parses a bare command with no args", () => {
    expect(parseCommandLine("status")).toEqual({ name: "status", args: [] });
  });

  it("parses a command with arguments", () => {
    expect(parseCommandLine("cd /engineering")).toEqual({ name: "cd", args: ["/engineering"] });
    expect(parseCommandLine("power security on")).toEqual({ name: "power", args: ["security", "on"] });
  });

  it("lowercases the command name but preserves argument casing", () => {
    expect(parseCommandLine("CAT /Crew/Reyes.log")).toEqual({ name: "cat", args: ["/Crew/Reyes.log"] });
  });

  it("respects double-quoted segments as a single argument", () => {
    expect(parseCommandLine('cat "/engineering/power log.txt"')).toEqual({
      name: "cat",
      args: ["/engineering/power log.txt"],
    });
  });

  it("collapses extra whitespace between tokens", () => {
    expect(parseCommandLine("  ls    /security  ")).toEqual({ name: "ls", args: ["/security"] });
  });
});
