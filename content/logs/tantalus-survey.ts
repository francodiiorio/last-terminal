import type { Localized } from "@/core/language";

export const TANTALUS_SURVEY = {
  id: "tantalus-survey",
  title: 'SURVEY ADDENDUM -- OBJECT "TANTALUS"',
  body: {
    en: [
      'SURVEY ADDENDUM -- OBJECT "TANTALUS"',
      "Catalogue ref: TNO-114/ADD",
      "Classification: internal, not for mission briefing packets",
      "",
      "Radar reflectivity across all sampled bands exceeds predicted values",
      "for any plausible ice/rock/metal composition by a wide margin.",
      "Recommend follow-up composition survey before any permanent",
      "installation is sited in proximity.",
      "",
      "[No follow-up survey on file. Site selection proceeded without one.]",
    ],
    "es-AR": [
      'ADENDA DE RELEVAMIENTO -- OBJETO "TÁNTALO"',
      "Ref. de catálogo: TNO-114/ADD",
      "Clasificación: interno, no incluir en los legajos de misión",
      "",
      "La reflectividad radar en todas las bandas muestreadas supera por un",
      "margen amplio los valores previstos para cualquier composición",
      "plausible de hielo, roca o metal. Se recomienda un relevamiento de",
      "composición de seguimiento antes de emplazar cualquier instalación",
      "permanente en las cercanías.",
      "",
      "[No hay relevamiento de seguimiento en el archivo. La selección del",
      "sitio se realizó sin uno.]",
    ],
  } satisfies Localized<string[]>,
};
