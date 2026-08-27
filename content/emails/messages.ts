import type { Condition } from "@/core/events/types";

/**
 * Unified shape for anything that shows up in the Communications app's inbox. Each entry is
 * also the single source of truth for the matching /communications/*.log file node in
 * content/files/tree.ts (same `id`, same `requires`, same `body`) -- there is exactly one copy
 * of this content, read the same way whether the player uses `cat` or the Comms app.
 */
export interface MessageDef {
  id: string;
  from: string;
  subject: string;
  timestamp: string;
  requires: Condition[];
  body: string[];
}

const REQUIRES_COMMS_ON: Condition[] = [{ type: "power", system: "communications", state: "on" }];

export const MESSAGES: MessageDef[] = [
  {
    id: "concord-correspondence",
    from: "Office of the Signal Program, the Concord",
    subject: "RE: Signal Program -- Findings Review (RESTRICTED)",
    timestamp: "MD 90 (archived)",
    requires: REQUIRES_COMMS_ON,
    body: [
      "CONCORD HQ -- SECURE CORRESPONDENCE (ARCHIVED)",
      "To: AION-7 / Dr. P. Anand-Kel",
      "Cc: AION-7 / CASSIUS (station custodian process)",
      "Classification: RESTRICTED -- SIGNAL PROGRAM",
      "",
      "MD 90 -- Findings reviewed. Confirmed: not consistent with any known",
      "uncrewed platform in our own catalogue or partner catalogues.",
      "",
      'Pending full verification, station-wide messaging will continue to',
      'reference the "legacy probe" hypothesis. This is not a request. Public',
      "charter and crew briefing materials are not to be amended without HQ",
      "sign-off.",
      "",
      "Dr. Anand-Kel retains full access to raw captures under existing NDA.",
      "CASSIUS is directed to maintain current notification and logging",
      "behavior for all other personnel pending further instruction.",
      "",
      "-- Office of the Signal Program, the Concord",
    ],
  },
  {
    id: "concord-status-request",
    from: "Office of the Signal Program, the Concord",
    subject: "Routine Status Request",
    timestamp: "MD 205",
    requires: REQUIRES_COMMS_ON,
    body: [
      "CONCORD HQ -- ROUTINE STATUS REQUEST",
      "To: AION-7 / Dr. P. Anand-Kel",
      "Classification: RESTRICTED -- SIGNAL PROGRAM",
      "",
      "MD 205 -- Per standing schedule, please confirm status of legacy-probe",
      "verification workstream. HQ review board meets MD 230; a preliminary",
      "finding would be useful input.",
      "",
      "No change to current messaging guidance. Continue current protocol.",
      "",
      "-- Office of the Signal Program, the Concord",
    ],
  },
  {
    id: "communications-incoming",
    from: "UNREGISTERED SOURCE",
    subject: "[non-repeating fragment]",
    timestamp: "MD 214 (present)",
    requires: [{ type: "flag", flag: "unknownTransmissionReceived", equals: true }],
    body: [
      "INCOMING TRANSMISSION -- SOURCE UNREGISTERED",
      "Bearing: consistent with Tantalus",
      "Signal type: non-repeating (does not match Chorus Signal baseline)",
      "",
      "[fragment, partial decode]",
      "",
      '  "...still reading, Priya. Confirm null point recalibration,',
      '  please confirm..."',
      "",
      "[transmission ends]",
      "",
      "CASSIUS: Fragment does not match any outbound station log. Source and",
      "method of capture unconfirmed. Logging for review.",
    ],
  },
];
