import type { Condition } from "@/core/events/types";

/**
 * Outbound draft templates offered by the Communications app. Deliberately not free-text --
 * the player picks a prewritten template, which keeps "what was sent" data-driven and testable
 * instead of parsing arbitrary player input as narrative content. Sending either is a real,
 * light-lag-flavored consequence (see docs/lore/STATION.md), not a scored choice -- endings are
 * Milestone 3 (docs/ROADMAP.md).
 */
export interface DraftDef {
  id: string;
  label: string;
  requires: Condition[];
  /** story flag set once this draft is sent */
  confirmFlag: string;
  confirmation: string[];
}

const REQUIRES_COMMS_ON: Condition[] = [{ type: "power", system: "communications", state: "on" }];

export const OUTBOUND_DRAFTS: DraftDef[] = [
  {
    id: "routine-status-update",
    label: "Send: Routine Status Update",
    requires: REQUIRES_COMMS_ON,
    confirmFlag: "sentRoutineStatusUpdate",
    confirmation: [
      "TRANSMISSION QUEUED -- OUTBOUND",
      "Routine status update queued for Concord HQ.",
      "ETA 6-14h (light-lag).",
    ],
  },
  {
    id: "incident-report",
    label: "Send: Incident Report (Cascade & Signal Findings)",
    requires: REQUIRES_COMMS_ON,
    confirmFlag: "sentIncidentReport",
    confirmation: [
      "TRANSMISSION QUEUED -- OUTBOUND",
      "Full incident report queued for Concord HQ.",
      "ETA 6-14h (light-lag).",
    ],
  },
];
