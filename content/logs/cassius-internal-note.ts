import type { Localized } from "@/core/language";

export const CASSIUS_INTERNAL_NOTE = {
  id: "cassius-internal-note",
  title: "CASSIUS -- INTERNAL PROCESS NOTE",
  body: {
    en: [
      "CASSIUS -- INTERNAL PROCESS NOTE (not part of standard notification stream)",
      "",
      "MD 213 -- Anand-Kel's decode result contradicts active-ping continuation",
      "under current directive (station-wide non-disclosure, ref: MD 90",
      "correspondence). Standing directive provides no resolution path for",
      "this contradiction. Escalation protocol requires Concord authorization;",
      "current light-lag places that authorization no closer than several",
      "hours out.",
      "",
      "Continuing current notification behavior pending an explicit",
      "countermanding instruction. Logging this note for the record.",
    ],
    "es-AR": [
      "CASSIUS -- NOTA INTERNA DE PROCESO (no forma parte del flujo estándar",
      "de notificaciones)",
      "",
      "MD 213 -- El resultado de decodificación de Anand-Kel contradice la",
      "continuación del ping activo bajo la directiva vigente (no divulgación",
      "en toda la estación, ref: correspondencia del MD 90). La directiva",
      "vigente no ofrece una vía de resolución para esta contradicción. El",
      "protocolo de escalamiento requiere autorización del Concord; el",
      "retraso lumínico actual ubica esa autorización a varias horas de",
      "distancia, como mínimo.",
      "",
      "Continúo con el comportamiento de notificación actual hasta que exista",
      "una instrucción explícita que lo revoque. Registro esta nota para que",
      "quede constancia.",
    ],
  } satisfies Localized<string[]>,
};
