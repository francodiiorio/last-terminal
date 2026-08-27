import type { GameEvent } from "@/core/events/types";

/**
 * Milestone 1 event chain (see docs/ROADMAP.md). Extends the vertical slice's two events with:
 * unlocking the new diagnostic tools once the player has read the first piece of evidence,
 * paying off the Sector C "movement" red herring via the camera feed (docs/lore/MYSTERY.md),
 * and a one-time warning if the player risks Life Support to free up headroom.
 */
export const MILESTONE1_EVENTS: GameEvent[] = [
  {
    id: "diagnostic-tools-unlocked",
    once: true,
    conditions: [{ type: "flag", flag: "read:engineering-power-log", equals: true }],
    actions: [
      { type: "unlockCommand", command: "scan" },
      { type: "unlockCommand", command: "camera" },
      { type: "unlockCommand", command: "decrypt" },
      { type: "unlockCommand", command: "route" },
      { type: "unlockCommand", command: "diagnostic" },
      {
        type: "notification",
        message: "New tools available: scan, camera, decrypt, route, diagnostic.",
        level: "info",
      },
    ],
  },
  {
    id: "sector-c-explained",
    once: true,
    conditions: [
      { type: "flag", flag: "viewedSectorCCamera", equals: true },
      { type: "flag", flag: "sectorCAlertTriggered", equals: true },
    ],
    actions: [
      {
        type: "notification",
        message:
          "Sensor SC-04 cross-referenced against structural stress logs. Likely cause: a micro-fracture flexing near the array mount. No personnel signature detected.",
        level: "info",
      },
      { type: "setFlag", flag: "sectorCExplained", value: true },
    ],
  },
  {
    id: "life-support-offline-warning",
    once: true,
    conditions: [{ type: "power", system: "life-support", state: "off" }],
    actions: [
      {
        type: "notification",
        message: "LIFE SUPPORT OFFLINE -- atmospheric reserve drawing down. Re-enable when able.",
        level: "critical",
      },
    ],
  },
];
