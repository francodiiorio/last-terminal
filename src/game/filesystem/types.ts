import type { Condition } from "@/core/events/types";

export interface FileSystemNode {
  id: string;
  /** absolute path, e.g. "/engineering/power-log.txt" */
  path: string;
  type: "file" | "dir";
  name: string;
  /** unset/empty = always accessible. Reuses the engine's Condition shape. */
  requires?: Condition[];
  /** file body, one entry per line. Only meaningful for type "file". */
  body?: string[];
  /** if true, `cat` refuses to print the body until the `decrypt` command has run on this file. */
  encrypted?: boolean;
}
