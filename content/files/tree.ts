import type { FileSystemNode } from "@/game/filesystem/types";
import { ENGINEERING_POWER_LOG } from "@content/logs/engineering-power-log";
import { SYSTEM_STATUS_LOG } from "@content/logs/system-status-log";
import { REYES_PERSONAL_LOG } from "@content/logs/reyes-personal-log";
import { SECURITY_INCIDENT_REPORT } from "@content/logs/security-incident-report";
import { UNKNOWN_TRANSMISSION } from "@content/emails/unknown-transmission";

/**
 * The vertical slice's filesystem tree, mirroring AION-7's sector layout
 * (see docs/lore/STATION.md). Milestone 1 extends this with the remaining
 * sectors and files from docs/lore/TIMELINE.md.
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

  { id: "dir-crew", path: "/crew", type: "dir", name: "crew" },
  {
    id: "reyes-personal-log",
    path: "/crew/reyes-personal.log",
    type: "file",
    name: "reyes-personal.log",
    body: REYES_PERSONAL_LOG.body,
  },

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

  { id: "dir-archive", path: "/archive", type: "dir", name: "archive" },
];
