import type { Condition } from "@/core/events/types";
import type { Localized } from "@/core/language";

export interface FileSystemNode {
  id: string;
  /** absolute path, e.g. "/engineering/power-log.txt" -- not localized, same as a real filename. */
  path: string;
  type: "file" | "dir";
  name: string;
  /** unset/empty = always accessible. Reuses the engine's Condition shape. */
  requires?: Condition[];
  /** file body, one entry per line, per language. Only meaningful for type "file". */
  body?: Localized<string[]>;
  /** if true, `cat` refuses to print the body until the `decrypt` command has run on this file. */
  encrypted?: boolean;
}
