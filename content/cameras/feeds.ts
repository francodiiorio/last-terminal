import type { Condition } from "@/core/events/types";

export interface CameraFeedDef {
  id: string;
  name: string;
  requires: Condition[];
  body: string[];
}

const REQUIRES_CAMERAS_ON: Condition[] = [{ type: "power", system: "cameras", state: "on" }];

/**
 * Text-based camera readouts -- AION-7's sensor grid is low-bandwidth by design (see
 * docs/lore/STATION.md tone notes), so feeds render as structured telemetry, not video.
 */
export const CAMERA_FEEDS: CameraFeedDef[] = [
  {
    id: "sector-c",
    name: "Sector C -- Array Mount Access",
    requires: REQUIRES_CAMERAS_ON,
    body: [
      "FEED: SECTOR C -- ARRAY MOUNT ACCESS CORRIDOR",
      "Resolution: LOW (reserve power) -- structural overlay only",
      "",
      "No thermal signature. No motion in current frame.",
      "Overlay flags a hairline stress fracture along the starboard bulkhead,",
      "consistent with engineering's MD 211 report. Panel flexes visibly in a",
      "20-second loop when reserve power cycles the corridor lighting.",
    ],
  },
  {
    id: "engineering-bay",
    name: "Engineering Bay",
    requires: REQUIRES_CAMERAS_ON,
    body: [
      "FEED: ENGINEERING BAY",
      "Resolution: LOW (reserve power)",
      "",
      "Workstations powered down. Lindqvist's terminal is still logged in.",
      "No motion detected.",
    ],
  },
  {
    id: "docking-bay",
    name: "Docking Bay",
    requires: REQUIRES_CAMERAS_ON,
    body: [
      "FEED: DOCKING BAY",
      "Resolution: LOW (reserve power)",
      "",
      "Airlock sealed and nominal. No craft docked. No motion detected.",
    ],
  },
];
