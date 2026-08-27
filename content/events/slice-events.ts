import type { GameEvent } from "@/core/events/types";

/**
 * Vertical-slice event chain. See docs/lore/MYSTERY.md for the discovery order this encodes:
 * powering Security surfaces the Sector C motion alert (a real consequence of the player's
 * power tradeoff); reading the resulting incident report -- which contradicts the assumption
 * that no one else could be awake -- triggers the slice's closing beat, an unexpected
 * transmission whose origin is deliberately left unresolved.
 */
export const SLICE_EVENTS: GameEvent[] = [
  {
    id: "sector-c-motion-alert",
    once: true,
    conditions: [{ type: "power", system: "security", state: "on" }],
    actions: [
      {
        type: "notification",
        message: {
          en: "MOTION SENSOR SC-04 -- SECTOR C. Cross-referencing archived incident data.",
          "es-AR": "SENSOR DE MOVIMIENTO SC-04 -- SECTOR C. Cruzando datos con incidentes archivados.",
        },
        level: "warning",
      },
      { type: "setFlag", flag: "sectorCAlertTriggered", value: true },
    ],
  },
  {
    id: "unknown-transmission-received",
    once: true,
    conditions: [{ type: "flag", flag: "read:security-incident-report", equals: true }],
    actions: [
      {
        type: "notification",
        message: {
          en: "INCOMING TRANSMISSION -- UNREGISTERED SOURCE.",
          "es-AR": "TRANSMISIÓN ENTRANTE -- FUENTE NO REGISTRADA.",
        },
        level: "critical",
      },
      { type: "setFlag", flag: "unknownTransmissionReceived", value: true },
    ],
  },
];
