import type { Condition } from "@/core/events/types";
import type { Localized } from "@/core/language";

export interface CameraFeedDef {
  id: string;
  name: Localized<string>;
  requires: Condition[];
  body: Localized<string[]>;
}

const REQUIRES_CAMERAS_ON: Condition[] = [{ type: "power", system: "cameras", state: "on" }];

/**
 * Text-based camera readouts -- AION-7's sensor grid is low-bandwidth by design (see
 * docs/lore/STATION.md tone notes), so feeds render as structured telemetry, not video.
 */
export const CAMERA_FEEDS: CameraFeedDef[] = [
  {
    id: "sector-c",
    name: { en: "Sector C -- Array Mount Access", "es-AR": "Sector C -- Acceso al Montaje de la Antena" },
    requires: REQUIRES_CAMERAS_ON,
    body: {
      en: [
        "FEED: SECTOR C -- ARRAY MOUNT ACCESS CORRIDOR",
        "Resolution: LOW (reserve power) -- structural overlay only",
        "",
        "No thermal signature. No motion in current frame.",
        "Overlay flags a hairline stress fracture along the starboard bulkhead,",
        "consistent with engineering's MD 211 report. Panel flexes visibly in a",
        "20-second loop when reserve power cycles the corridor lighting.",
      ],
      "es-AR": [
        "CÁMARA: SECTOR C -- PASILLO DE ACCESO AL MONTAJE DE LA ANTENA",
        "Resolución: BAJA (energía de reserva) -- solo superposición estructural",
        "",
        "Sin firma térmica. Sin movimiento en el cuadro actual.",
        "La superposición marca una fisura capilar por tensión en el mamparo de",
        "estribor, que coincide con el informe de ingeniería del MD 211. El panel",
        "flexiona de forma visible en un ciclo de 20 segundos cuando la energía",
        "de reserva alterna la iluminación del pasillo.",
      ],
    },
  },
  {
    id: "engineering-bay",
    name: { en: "Engineering Bay", "es-AR": "Bahía de Ingeniería" },
    requires: REQUIRES_CAMERAS_ON,
    body: {
      en: [
        "FEED: ENGINEERING BAY",
        "Resolution: LOW (reserve power)",
        "",
        "Workstations powered down. Lindqvist's terminal is still logged in.",
        "No motion detected.",
      ],
      "es-AR": [
        "CÁMARA: BAHÍA DE INGENIERÍA",
        "Resolución: BAJA (energía de reserva)",
        "",
        "Estaciones de trabajo apagadas. La terminal de Lindqvist sigue con la",
        "sesión iniciada. Sin movimiento detectado.",
      ],
    },
  },
  {
    id: "docking-bay",
    name: { en: "Docking Bay", "es-AR": "Bahía de Acoplamiento" },
    requires: REQUIRES_CAMERAS_ON,
    body: {
      en: [
        "FEED: DOCKING BAY",
        "Resolution: LOW (reserve power)",
        "",
        "Airlock sealed and nominal. No craft docked. No motion detected.",
      ],
      "es-AR": [
        "CÁMARA: BAHÍA DE ACOPLAMIENTO",
        "Resolución: BAJA (energía de reserva)",
        "",
        "Esclusa sellada y nominal. Sin naves acopladas. Sin movimiento detectado.",
      ],
    },
  },
];
