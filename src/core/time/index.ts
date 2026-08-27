/**
 * Narrative time is not a real-time clock — it only advances in response to player actions.
 * These are the reference costs from docs/GAME_DESIGN.md; content/engine callers pass their
 * own minute values, this module just centralizes the defaults so they aren't duplicated.
 */
export const TIME_COSTS = {
  openCamera: 1,
  decryptFile: 4,
  runDiagnostic: 6,
  restartSystem: 12,
} as const;

export function advanceMinutes(currentMinutes: number, delta: number): number {
  return currentMinutes + delta;
}

export function formatStationTime(minutesElapsed: number): string {
  const totalMinutes = Math.max(0, Math.floor(minutesElapsed));
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
