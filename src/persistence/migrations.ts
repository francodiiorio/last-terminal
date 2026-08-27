import type { GameSnapshot } from "@/store/types";

/**
 * Each entry migrates FROM its key version TO key+1. Add entries here when GameSnapshot's
 * shape changes; never mutate an old snapshot's meaning in place. Empty for schema v1.
 */
type MigrationFn = (data: unknown) => unknown;
const MIGRATIONS: Record<number, MigrationFn> = {};

export const CURRENT_SCHEMA_VERSION = 1;

export function migrateToLatest(data: unknown, fromVersion: number): GameSnapshot {
  let current = data;
  let version = fromVersion;
  while (version < CURRENT_SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) break;
    current = migrate(current);
    version += 1;
  }
  return current as GameSnapshot;
}
