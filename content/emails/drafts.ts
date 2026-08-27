import type { Condition } from "@/core/events/types";
import type { Localized } from "@/core/language";

/**
 * Outbound draft templates offered by the Communications app. Deliberately not free-text --
 * the player picks a prewritten template, which keeps "what was sent" data-driven and testable
 * instead of parsing arbitrary player input as narrative content. Sending either is a real,
 * light-lag-flavored consequence (see docs/lore/STATION.md), not a scored choice -- endings are
 * Milestone 3 (docs/ROADMAP.md).
 */
export interface DraftDef {
  id: string;
  label: Localized<string>;
  requires: Condition[];
  /** story flag set once this draft is sent */
  confirmFlag: string;
  confirmation: Localized<string[]>;
}

const REQUIRES_COMMS_ON: Condition[] = [{ type: "power", system: "communications", state: "on" }];

export const OUTBOUND_DRAFTS: DraftDef[] = [
  {
    id: "routine-status-update",
    label: { en: "Send: Routine Status Update", "es-AR": "Enviar: Actualización de Estado de Rutina" },
    requires: REQUIRES_COMMS_ON,
    confirmFlag: "sentRoutineStatusUpdate",
    confirmation: {
      en: [
        "TRANSMISSION QUEUED -- OUTBOUND",
        "Routine status update queued for Concord HQ.",
        "ETA 6-14h (light-lag).",
      ],
      "es-AR": [
        "TRANSMISIÓN EN COLA -- SALIENTE",
        "Actualización de estado de rutina en cola para el Cuartel General del Concord.",
        "ETA 6-14h (retraso lumínico).",
      ],
    },
  },
  {
    id: "incident-report",
    label: {
      en: "Send: Incident Report (Cascade & Signal Findings)",
      "es-AR": "Enviar: Informe de Incidente (Cascada y Hallazgos de Señal)",
    },
    requires: REQUIRES_COMMS_ON,
    confirmFlag: "sentIncidentReport",
    confirmation: {
      en: [
        "TRANSMISSION QUEUED -- OUTBOUND",
        "Full incident report queued for Concord HQ.",
        "ETA 6-14h (light-lag).",
      ],
      "es-AR": [
        "TRANSMISIÓN EN COLA -- SALIENTE",
        "Informe de incidente completo en cola para el Cuartel General del Concord.",
        "ETA 6-14h (retraso lumínico).",
      ],
    },
  },
];
