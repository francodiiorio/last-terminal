import type { Localized } from "@/core/language";

export const SECURITY_INCIDENT_REPORT = {
  id: "security-incident-report",
  title: "SECURITY INCIDENT REPORT — SR-1142",
  body: {
    en: [
      "SECURITY INCIDENT REPORT -- SR-1142",
      "Classification: Sector C",
      "Filed by: Automated Sensor Log (CASSIUS)",
      "",
      "MD 214 0511 -- Motion sensor SC-04 triggered. Sector C, corridor",
      "adjacent to array mount access. Duration: 4 seconds. Attributed to:",
      "personnel movement.",
      "",
      "NOTE: Cross-reference against deep-watch manifest at time of trigger",
      "shows zero personnel with stasis-cleared mobility in Sector C.",
      "Attribution unresolved.",
      "",
      "STATUS: Open. No follow-up filed before station-wide power failure.",
    ],
    "es-AR": [
      "INFORME DE INCIDENTE DE SEGURIDAD -- SR-1142",
      "Clasificación: Sector C",
      "Presentado por: Registro Automatizado de Sensores (CASSIUS)",
      "",
      "MD 214 0511 -- Se activó el sensor de movimiento SC-04. Sector C,",
      "pasillo adyacente al acceso del montaje de la antena. Duración: 4",
      "segundos. Atribuido a: movimiento de personal.",
      "",
      "NOTA: El cruce con el manifiesto de estasis profunda al momento de la",
      "activación muestra cero personal con movilidad habilitada fuera de",
      "estasis en el Sector C. Atribución sin resolver.",
      "",
      "ESTADO: Abierto. No se presentó seguimiento antes de la falla de",
      "energía en toda la estación.",
    ],
  } satisfies Localized<string[]>,
};
