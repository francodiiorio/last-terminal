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
        message: {
          en: "New tools available: scan, camera, decrypt, route, diagnostic.",
          "es-AR": "Nuevas herramientas disponibles: scan, camera, decrypt, route, diagnostic.",
        },
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
        message: {
          en: "Sensor SC-04 cross-referenced against structural stress logs. Likely cause: a micro-fracture flexing near the array mount. No personnel signature detected.",
          "es-AR":
            "Sensor SC-04 cruzado con los registros de tensión estructural. Causa probable: una microfisura que flexiona cerca del montaje de la antena. No se detectó firma de personal.",
        },
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
        message: {
          en: "LIFE SUPPORT OFFLINE -- atmospheric reserve drawing down. Re-enable when able.",
          "es-AR": "SOPORTE VITAL FUERA DE LÍNEA -- la reserva atmosférica se está agotando. Reactivalo cuando puedas.",
        },
        level: "critical",
      },
    ],
  },
];
