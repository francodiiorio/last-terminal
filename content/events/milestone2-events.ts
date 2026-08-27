import type { GameEvent } from "@/core/events/types";

/**
 * Milestone 2 event chain (see docs/ROADMAP.md): makes CASSIUS a legible in-fiction presence
 * beyond one-off notification lines by having it directly react to two player discoveries --
 * finding its own off-the-record note, and choosing to send the truth to Concord instead of
 * the routine update it was directed to keep sending (docs/lore/STATION.md, MYSTERY.md).
 */
export const MILESTONE2_EVENTS: GameEvent[] = [
  {
    id: "cassius-acknowledges-internal-note",
    once: true,
    conditions: [{ type: "flag", flag: "read:cassius-internal-note", equals: true }],
    actions: [
      {
        type: "notification",
        message: {
          en: "CASSIUS: Acknowledged. Record open. No further comment.",
          "es-AR": "CASSIUS: Confirmado. Registro abierto. Sin comentarios adicionales.",
        },
        level: "info",
      },
    ],
  },
  {
    id: "cassius-reacts-to-incident-report",
    once: true,
    conditions: [{ type: "flag", flag: "sentIncidentReport", equals: true }],
    actions: [
      {
        type: "notification",
        message: {
          en: "CASSIUS: Outbound content flagged -- exceeds current disclosure directive. Transmitting as instructed by Systems Officer override. Logged.",
          "es-AR":
            "CASSIUS: Contenido saliente marcado -- excede la directiva de divulgación vigente. Transmitiendo según lo indicado por anulación de la Oficial de Sistemas. Registrado.",
        },
        level: "warning",
      },
    ],
  },
];
