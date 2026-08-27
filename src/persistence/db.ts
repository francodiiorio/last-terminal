import Dexie, { type Table } from "dexie";
import type { GameSnapshot } from "@/store/types";

export interface SaveRecord {
  slot: string;
  schemaVersion: number;
  updatedAt: number;
  data: GameSnapshot;
  /** human-readable name for manual save slots; the "autosave" slot has none (displayed as "Autosave") */
  label?: string;
}

export interface MetaRecord {
  key: string;
  value: unknown;
}

class LastTerminalDB extends Dexie {
  saves!: Table<SaveRecord, string>;
  meta!: Table<MetaRecord, string>;

  constructor() {
    super("last-terminal");
    this.version(1).stores({
      saves: "&slot, updatedAt",
      meta: "&key",
    });
  }
}

export const db = new LastTerminalDB();
