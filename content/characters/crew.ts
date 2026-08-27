import type { Localized } from "@/core/language";

/**
 * Structured crew manifest, source of truth for the /crew/*.personnel files generated in
 * content/files/tree.ts. Kept in sync with docs/lore/CHARACTERS.md -- that document is the
 * authoritative prose version; update both together. Names are proper nouns and are never
 * localized; Reyes's role/note phrasing avoids gendered forms (see docs/lore/CHARACTERS.md --
 * gender is intentionally unspecified), the other five use forms consistent with their names.
 */
export interface CrewMember {
  id: string;
  name: string;
  role: Localized<string>;
  status: "player-character" | "confirmed-deceased" | "unresolved";
  /** short personnel-file body, in the station's clipped administrative register */
  note: Localized<string[]>;
}

export const CREW: CrewMember[] = [
  {
    id: "reyes",
    name: "Reyes",
    role: { en: "Systems & Logistics Officer", "es-AR": "Oficial de Sistemas y Logística" },
    status: "player-character",
    note: {
      en: ["See /crew/reyes-personal.log for personal records."],
      "es-AR": ["Ver /crew/reyes-personal.log para los registros personales."],
    },
  },
  {
    id: "anand-kel",
    name: "Dr. Priya Anand-Kel",
    role: { en: "Lead Signal Analyst", "es-AR": "Analista Principal de Señales" },
    status: "unresolved",
    note: {
      en: [
        "Senior signal analysis lead. Highest clearance among science staff.",
        "Deep-watch status: UNCONFIRMED at time of last system update.",
      ],
      "es-AR": [
        "Analista principal de señales, con mayor rango. Máximo nivel de",
        "autorización entre el personal científico.",
        "Estado de estasis profunda: SIN CONFIRMAR al momento de la última",
        "actualización del sistema.",
      ],
    },
  },
  {
    id: "bakke",
    name: "Dr. Soren Bakke",
    role: { en: "Astrophysicist", "es-AR": "Astrofísico" },
    status: "confirmed-deceased",
    note: {
      en: [
        "Structural and orbital survey lead, Tantalus.",
        "Deep-watch status: STASIS FAILURE, MD 214 0500. Deceased.",
        "See /system/deepwatch-status.log.",
      ],
      "es-AR": [
        "Responsable de relevamiento estructural y orbital, Tántalo.",
        "Estado de estasis profunda: FALLA DE ESTASIS, MD 214 0500. Fallecido.",
        "Ver /system/deepwatch-status.log.",
      ],
    },
  },
  {
    id: "lindqvist",
    name: "Petra Lindqvist",
    role: { en: "Chief Engineer", "es-AR": "Ingeniera Jefa" },
    status: "unresolved",
    note: {
      en: ["Power systems and hull integrity.", "Deep-watch status: UNCONFIRMED at time of last system update."],
      "es-AR": [
        "Sistemas de energía e integridad del casco.",
        "Estado de estasis profunda: SIN CONFIRMAR al momento de la última",
        "actualización del sistema.",
      ],
    },
  },
  {
    id: "faraday",
    name: "Cole Faraday",
    role: { en: "Communications Technician", "es-AR": "Técnico de Comunicaciones" },
    status: "unresolved",
    note: {
      en: ["Outbound traffic and Concord correspondence.", "Deep-watch status: UNCONFIRMED at time of last system update."],
      "es-AR": [
        "Tráfico saliente y correspondencia con el Concord.",
        "Estado de estasis profunda: SIN CONFIRMAR al momento de la última",
        "actualización del sistema.",
      ],
    },
  },
  {
    id: "idris",
    name: "Dr. Yusuf Idris",
    role: { en: "Medical Officer", "es-AR": "Oficial Médico" },
    status: "unresolved",
    note: {
      en: ["Station physician.", "Deep-watch status: UNCONFIRMED at time of last system update."],
      "es-AR": [
        "Médico de la estación.",
        "Estado de estasis profunda: SIN CONFIRMAR al momento de la última",
        "actualización del sistema.",
      ],
    },
  },
];
