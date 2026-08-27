import type { EventWorldState } from "@/core/events/types";
import { evaluateConditions } from "@/core/conditions";
import type { FileSystemNode } from "@/game/filesystem/types";

export function normalizePath(path: string): string {
  const parts = path.split("/").filter((p) => p.length > 0 && p !== ".");
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return "/" + stack.join("/");
}

/** Resolves `input` (absolute or relative) against `cwd` into a normalized absolute path. */
export function resolvePath(cwd: string, input: string): string {
  if (input.startsWith("/")) return normalizePath(input);
  return normalizePath(`${cwd}/${input}`);
}

export function getNode(nodes: FileSystemNode[], path: string): FileSystemNode | undefined {
  const target = normalizePath(path);
  return nodes.find((n) => n.path === target);
}

/** Direct children of `dirPath`, both files and dirs, regardless of lock state (callers decide display). */
export function listChildren(nodes: FileSystemNode[], dirPath: string): FileSystemNode[] {
  const dir = normalizePath(dirPath);
  const prefix = dir === "/" ? "/" : `${dir}/`;
  return nodes.filter((n) => {
    if (n.path === dir) return false;
    if (!n.path.startsWith(prefix)) return false;
    const rest = n.path.slice(prefix.length);
    return rest.length > 0 && !rest.includes("/");
  });
}

/**
 * A node is accessible if it has no requirements, its requirements are currently satisfied,
 * or it was explicitly granted access via an event's `unlockFile` action (tracked separately
 * in the filesystem store slice as `unlockedIds`, independent of live condition state).
 */
export function isAccessible(
  node: FileSystemNode,
  world: EventWorldState,
  unlockedIds?: ReadonlySet<string>,
): boolean {
  if (unlockedIds?.has(node.id)) return true;
  if (!node.requires || node.requires.length === 0) return true;
  return evaluateConditions(node.requires, world);
}
