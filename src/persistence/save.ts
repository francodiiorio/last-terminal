import { db } from "@/persistence/db";
import { CURRENT_SCHEMA_VERSION, migrateToLatest } from "@/persistence/migrations";
import type { GameSnapshot } from "@/store/types";

export const AUTOSAVE_SLOT = "autosave";

export async function saveGame(slot: string, data: GameSnapshot): Promise<void> {
  await db.saves.put({ slot, schemaVersion: CURRENT_SCHEMA_VERSION, updatedAt: Date.now(), data });
}

export async function loadGame(slot: string): Promise<GameSnapshot | undefined> {
  const record = await db.saves.get(slot);
  if (!record) return undefined;
  return migrateToLatest(record.data, record.schemaVersion);
}

export async function hasSave(slot: string = AUTOSAVE_SLOT): Promise<boolean> {
  return (await db.saves.get(slot)) !== undefined;
}

export async function deleteSave(slot: string): Promise<void> {
  await db.saves.delete(slot);
}

interface SaveFileEnvelope {
  schemaVersion: number;
  exportedAt: number;
  data: GameSnapshot;
}

export function serializeSave(data: GameSnapshot): string {
  const envelope: SaveFileEnvelope = { schemaVersion: CURRENT_SCHEMA_VERSION, exportedAt: Date.now(), data };
  return JSON.stringify(envelope, null, 2);
}

export function deserializeSave(json: string): GameSnapshot {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Save file is not valid JSON.");
  }
  if (typeof parsed !== "object" || parsed === null || !("data" in parsed)) {
    throw new Error("Save file is missing required fields.");
  }
  const envelope = parsed as Partial<SaveFileEnvelope>;
  const schemaVersion = typeof envelope.schemaVersion === "number" ? envelope.schemaVersion : 1;
  return migrateToLatest(envelope.data, schemaVersion);
}
