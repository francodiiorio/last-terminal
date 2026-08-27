import { describe, expect, it } from "vitest";
import { getNode, isAccessible, listChildren, normalizePath, resolvePath } from "@/game/filesystem/resolve";
import type { FileSystemNode } from "@/game/filesystem/types";
import type { EventWorldState } from "@/core/events/types";

const NODES: FileSystemNode[] = [
  { id: "dir-engineering", path: "/engineering", type: "dir", name: "engineering" },
  { id: "power-log", path: "/engineering/power-log.txt", type: "file", name: "power-log.txt", body: ["a"] },
  { id: "dir-security", path: "/security", type: "dir", name: "security" },
  {
    id: "incident-report",
    path: "/security/incident-report.log",
    type: "file",
    name: "incident-report.log",
    body: ["b"],
    requires: [{ type: "power", system: "security", state: "on" }],
  },
];

const world = (overrides: Partial<EventWorldState> = {}): EventWorldState => ({
  flags: {},
  power: {},
  minutesElapsed: 0,
  ...overrides,
});

describe("normalizePath / resolvePath", () => {
  it("normalizes redundant separators and '.' segments", () => {
    expect(normalizePath("/engineering//power-log.txt")).toBe("/engineering/power-log.txt");
    expect(normalizePath("/engineering/./power-log.txt")).toBe("/engineering/power-log.txt");
  });

  it("resolves '..' segments", () => {
    expect(normalizePath("/engineering/../security")).toBe("/security");
  });

  it("resolves a relative path against cwd", () => {
    expect(resolvePath("/engineering", "power-log.txt")).toBe("/engineering/power-log.txt");
    expect(resolvePath("/engineering", "../security")).toBe("/security");
  });

  it("treats a leading slash as absolute regardless of cwd", () => {
    expect(resolvePath("/engineering", "/security")).toBe("/security");
  });
});

describe("getNode / listChildren", () => {
  it("finds a node by exact normalized path", () => {
    expect(getNode(NODES, "/engineering/power-log.txt")?.id).toBe("power-log");
    expect(getNode(NODES, "/nowhere")).toBeUndefined();
  });

  it("lists only direct children of a directory", () => {
    const children = listChildren(NODES, "/");
    expect(children.map((n) => n.id).sort()).toEqual(["dir-engineering", "dir-security"]);
  });

  it("lists files inside a subdirectory", () => {
    const children = listChildren(NODES, "/engineering");
    expect(children.map((n) => n.id)).toEqual(["power-log"]);
  });
});

describe("isAccessible", () => {
  it("a node with no requirements is always accessible", () => {
    const node = getNode(NODES, "/engineering/power-log.txt")!;
    expect(isAccessible(node, world())).toBe(true);
  });

  it("a gated node is inaccessible until its condition is met", () => {
    const node = getNode(NODES, "/security/incident-report.log")!;
    expect(isAccessible(node, world())).toBe(false);
    expect(isAccessible(node, world({ power: { security: "on" } }))).toBe(true);
  });

  it("an explicit unlock overrides an unmet requirement", () => {
    const node = getNode(NODES, "/security/incident-report.log")!;
    expect(isAccessible(node, world(), new Set(["incident-report"]))).toBe(true);
  });
});
