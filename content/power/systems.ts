import type { PowerSystemDef } from "@/game/power/types";

/**
 * AION-7 is running on emergency reserve power after the Cascade (see docs/lore/TIMELINE.md,
 * MD 214). Nominal full-crew capacity is ~550kW; the reserve budget below is a fraction of that.
 */
export const STATION_POWER_BUDGET_KW = 180;

export const POWER_SYSTEMS: PowerSystemDef[] = [
  {
    id: "life-support",
    name: { en: "Life Support", "es-AR": "Soporte Vital" },
    consumptionKw: 80,
    priority: 0,
    defaultOn: true,
    description: {
      en: "Atmosphere, temperature, and pressure regulation.",
      "es-AR": "Regulación de atmósfera, temperatura y presión.",
    },
  },
  {
    id: "terminal",
    name: { en: "Terminal", "es-AR": "Terminal" },
    consumptionKw: 10,
    priority: 1,
    defaultOn: true,
    description: {
      en: "TOS core services: shell, filesystem, notifications.",
      "es-AR": "Servicios principales de TOS: shell, sistema de archivos, notificaciones.",
    },
  },
  {
    id: "cameras",
    name: { en: "Cameras", "es-AR": "Cámaras" },
    consumptionKw: 35,
    priority: 2,
    defaultOn: true,
    description: {
      en: "Station-wide visual sensor grid.",
      "es-AR": "Red de sensores visuales de toda la estación.",
    },
  },
  {
    id: "security",
    name: { en: "Security", "es-AR": "Seguridad" },
    consumptionKw: 90,
    priority: 3,
    defaultOn: false,
    description: {
      en: "Access control, incident logging, sector sensors.",
      "es-AR": "Control de acceso, registro de incidentes, sensores de sector.",
    },
  },
  {
    id: "communications",
    name: { en: "Communications", "es-AR": "Comunicaciones" },
    consumptionKw: 120,
    priority: 4,
    defaultOn: false,
    lockedReason: {
      en: "ARRAY OFFLINE — CASCADE DAMAGE. Run 'diagnostic communications', then 'route communications' to repair.",
      "es-AR": "ANTENA FUERA DE LÍNEA — DAÑO POR LA CASCADA. Ejecutá 'diagnostic communications' y después 'route communications' para reparar.",
    },
    unlockRequires: [{ type: "flag", flag: "communicationsRepaired", equals: true }],
    description: {
      en: "Primary dish, deep-space relay, Concord correspondence.",
      "es-AR": "Antena principal, enlace de espacio profundo, correspondencia con el Concord.",
    },
  },
  {
    id: "laboratory",
    name: { en: "Laboratory", "es-AR": "Laboratorio" },
    consumptionKw: 65,
    priority: 5,
    defaultOn: false,
    lockedReason: {
      en: "SECTOR SEALED — pending structural inspection. Run 'scan laboratory' to clear it.",
      "es-AR": "SECTOR SELLADO — pendiente de inspección estructural. Ejecutá 'scan laboratory' para habilitarlo.",
    },
    unlockRequires: [{ type: "flag", flag: "labStructuralClear", equals: true }],
    description: {
      en: "Signal analysis and physical sample equipment.",
      "es-AR": "Análisis de señales y equipo para muestras físicas.",
    },
  },
  {
    id: "navigation",
    name: { en: "Navigation", "es-AR": "Navegación" },
    consumptionKw: 150,
    priority: 6,
    defaultOn: false,
    lockedReason: {
      en: "NOT REQUIRED — station is not under thrust.",
      "es-AR": "NO SE REQUIERE — la estación no está bajo propulsión.",
    },
    description: {
      en: "Orbital control and thruster management.",
      "es-AR": "Control orbital y gestión de propulsores.",
    },
  },
];
