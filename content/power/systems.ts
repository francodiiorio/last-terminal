import type { PowerSystemDef } from "@/game/power/types";

/**
 * AION-7 is running on emergency reserve power after the Cascade (see docs/lore/TIMELINE.md,
 * MD 214). Nominal full-crew capacity is ~550kW; the reserve budget below is a fraction of that.
 */
export const STATION_POWER_BUDGET_KW = 180;

export const POWER_SYSTEMS: PowerSystemDef[] = [
  {
    id: "life-support",
    name: "Life Support",
    consumptionKw: 80,
    priority: 0,
    defaultOn: true,
    description: "Atmosphere, temperature, and pressure regulation.",
  },
  {
    id: "terminal",
    name: "Terminal",
    consumptionKw: 10,
    priority: 1,
    defaultOn: true,
    description: "TOS core services: shell, filesystem, notifications.",
  },
  {
    id: "cameras",
    name: "Cameras",
    consumptionKw: 35,
    priority: 2,
    defaultOn: true,
    description: "Station-wide visual sensor grid.",
  },
  {
    id: "security",
    name: "Security",
    consumptionKw: 90,
    priority: 3,
    defaultOn: false,
    description: "Access control, incident logging, sector sensors.",
  },
  {
    id: "communications",
    name: "Communications",
    consumptionKw: 120,
    priority: 4,
    defaultOn: false,
    lockedReason: "ARRAY OFFLINE — CASCADE DAMAGE. Repair required before this system can draw power.",
    description: "Primary dish, deep-space relay, Concord correspondence.",
  },
  {
    id: "laboratory",
    name: "Laboratory",
    consumptionKw: 65,
    priority: 5,
    defaultOn: false,
    lockedReason: "SECTOR SEALED — pending structural inspection.",
    description: "Signal analysis and physical sample equipment.",
  },
  {
    id: "navigation",
    name: "Navigation",
    consumptionKw: 150,
    priority: 6,
    defaultOn: false,
    lockedReason: "NOT REQUIRED — station is not under thrust.",
    description: "Orbital control and thruster management.",
  },
];
