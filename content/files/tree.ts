import type { FileSystemNode } from "@/game/filesystem/types";
import { ENGINEERING_POWER_LOG } from "@content/logs/engineering-power-log";
import { SYSTEM_STATUS_LOG } from "@content/logs/system-status-log";
import { REYES_PERSONAL_LOG } from "@content/logs/reyes-personal-log";
import { SECURITY_INCIDENT_REPORT } from "@content/logs/security-incident-report";
import { DEEPWATCH_STATUS_LOG } from "@content/logs/deepwatch-status-log";
import { CONCORD_CORRESPONDENCE } from "@content/logs/concord-correspondence";
import { TANTALUS_SURVEY } from "@content/logs/tantalus-survey";
import { UNKNOWN_TRANSMISSION } from "@content/emails/unknown-transmission";
import { CREW } from "@content/characters/crew";

/**
 * Personnel files for every crew member except Reyes (whose personal log is its own file
 * above). Generated from content/characters/crew.ts so the roster only has one source of
 * truth -- see docs/lore/CHARACTERS.md for the prose version both are kept in sync with.
 */
const CREW_PERSONNEL_NODES: FileSystemNode[] = CREW.filter((member) => member.id !== "reyes").map((member) => ({
  id: `personnel-${member.id}`,
  path: `/crew/${member.id}.personnel`,
  type: "file",
  name: `${member.id}.personnel`,
  body: [`PERSONNEL FILE -- ${member.name.toUpperCase()}`, `Role: ${member.role}`, "", ...member.note],
}));

/**
 * The filesystem tree, mirroring AION-7's sector layout (see docs/lore/STATION.md).
 * Milestone 1 populates crew/, communications/, and archive/ beyond the vertical slice's
 * original four files; see docs/lore/TIMELINE.md for the events each file traces back to.
 */
export const FILESYSTEM_NODES: FileSystemNode[] = [
  { id: "dir-system", path: "/system", type: "dir", name: "system" },
  {
    id: "system-status-log",
    path: "/system/status.log",
    type: "file",
    name: "status.log",
    body: SYSTEM_STATUS_LOG.body,
  },
  {
    id: "deepwatch-status-log",
    path: "/system/deepwatch-status.log",
    type: "file",
    name: "deepwatch-status.log",
    body: DEEPWATCH_STATUS_LOG.body,
  },

  { id: "dir-crew", path: "/crew", type: "dir", name: "crew" },
  {
    id: "reyes-personal-log",
    path: "/crew/reyes-personal.log",
    type: "file",
    name: "reyes-personal.log",
    body: REYES_PERSONAL_LOG.body,
  },
  ...CREW_PERSONNEL_NODES,

  { id: "dir-engineering", path: "/engineering", type: "dir", name: "engineering" },
  {
    id: "engineering-power-log",
    path: "/engineering/power-log.txt",
    type: "file",
    name: "power-log.txt",
    body: ENGINEERING_POWER_LOG.body,
  },

  { id: "dir-security", path: "/security", type: "dir", name: "security" },
  {
    id: "security-incident-report",
    path: "/security/incident-report.log",
    type: "file",
    name: "incident-report.log",
    body: SECURITY_INCIDENT_REPORT.body,
    requires: [{ type: "power", system: "security", state: "on" }],
  },

  { id: "dir-communications", path: "/communications", type: "dir", name: "communications" },
  {
    id: "communications-incoming",
    path: "/communications/incoming.log",
    type: "file",
    name: "incoming.log",
    body: UNKNOWN_TRANSMISSION.body,
    requires: [{ type: "flag", flag: "unknownTransmissionReceived", equals: true }],
  },
  {
    id: "concord-correspondence",
    path: "/communications/concord-correspondence.log",
    type: "file",
    name: "concord-correspondence.log",
    body: CONCORD_CORRESPONDENCE.body,
    requires: [{ type: "power", system: "communications", state: "on" }],
  },

  { id: "dir-archive", path: "/archive", type: "dir", name: "archive" },
  {
    id: "tantalus-survey",
    path: "/archive/tantalus-survey.txt",
    type: "file",
    name: "tantalus-survey.txt",
    body: TANTALUS_SURVEY.body,
    requires: [{ type: "power", system: "laboratory", state: "on" }],
    encrypted: true,
  },
];
