import type { Condition } from "@/core/events/types";
import type { Localized } from "@/core/language";

/**
 * Unified shape for anything that shows up in the Communications app's inbox. Each entry is
 * also the single source of truth for the matching /communications/*.log file node in
 * content/files/tree.ts (same `id`, same `requires`, same `body`) -- there is exactly one copy
 * of this content, read the same way whether the player uses `cat` or the Comms app.
 */
export interface MessageDef {
  id: string;
  from: Localized<string>;
  subject: Localized<string>;
  timestamp: string;
  requires: Condition[];
  body: Localized<string[]>;
}

const REQUIRES_COMMS_ON: Condition[] = [{ type: "power", system: "communications", state: "on" }];

export const MESSAGES: MessageDef[] = [
  {
    id: "concord-correspondence",
    from: { en: "Office of the Signal Program, the Concord", "es-AR": "Oficina del Programa de Señal, el Concord" },
    subject: {
      en: "RE: Signal Program -- Findings Review (RESTRICTED)",
      "es-AR": "RE: Programa de Señal -- Revisión de Hallazgos (RESTRINGIDO)",
    },
    timestamp: "MD 90",
    requires: REQUIRES_COMMS_ON,
    body: {
      en: [
        "CONCORD HQ -- SECURE CORRESPONDENCE (ARCHIVED)",
        "",
        "To: AION-7 / Dr. P. Anand-Kel",
        "",
        "Cc: AION-7 / CASSIUS (station custodian process)",
        "",
        "Classification: RESTRICTED -- SIGNAL PROGRAM",
        "",
        "MD 90 -- Findings reviewed. Confirmed: not consistent with any known",
        "uncrewed platform in our own catalogue or partner catalogues.",
        "",
        'Pending full verification, station-wide messaging will continue to',
        'reference the "legacy probe" hypothesis. This is not a request. Public',
        "charter and crew briefing materials are not to be amended without HQ",
        "sign-off.",
        "",
        "Dr. Anand-Kel retains full access to raw captures under existing NDA.",
        "CASSIUS is directed to maintain current notification and logging",
        "behavior for all other personnel pending further instruction.",
        "",
        "-- Office of the Signal Program, the Concord",
      ],
      "es-AR": [
        "CUARTEL GENERAL DEL CONCORD -- CORRESPONDENCIA SEGURA (ARCHIVADA)",
        "",
        "Para: AION-7 / Dra. P. Anand-Kel",
        "",
        "Cc: AION-7 / CASSIUS (proceso custodio de la estación)",
        "",
        "Clasificación: RESTRINGIDO -- PROGRAMA DE SEÑAL",
        "",
        "MD 90 -- Hallazgos revisados. Confirmado: no coincide con ninguna",
        "plataforma no tripulada conocida en nuestro catálogo ni en los de",
        "organismos asociados.",
        "",
        'Hasta que se complete la verificación, la comunicación en toda la',
        'estación va a seguir haciendo referencia a la hipótesis de la "sonda',
        'heredada". Esto no es un pedido. El estatuto público y el material',
        "informativo de la tripulación no pueden modificarse sin autorización",
        "del Cuartel General.",
        "",
        "La Dra. Anand-Kel conserva acceso total a las capturas sin procesar",
        "bajo el acuerdo de confidencialidad vigente. Se instruye a CASSIUS a",
        "mantener el comportamiento actual de notificación y registro para el",
        "resto del personal, hasta nuevo aviso.",
        "",
        "-- Oficina del Programa de Señal, el Concord",
      ],
    },
  },
  {
    id: "concord-status-request",
    from: { en: "Office of the Signal Program, the Concord", "es-AR": "Oficina del Programa de Señal, el Concord" },
    subject: { en: "Routine Status Request", "es-AR": "Solicitud de Estado de Rutina" },
    timestamp: "MD 205",
    requires: REQUIRES_COMMS_ON,
    body: {
      en: [
        "CONCORD HQ -- ROUTINE STATUS REQUEST",
        "",
        "To: AION-7 / Dr. P. Anand-Kel",
        "",
        "Classification: RESTRICTED -- SIGNAL PROGRAM",
        "",
        "MD 205 -- Per standing schedule, please confirm status of legacy-probe",
        "verification workstream. HQ review board meets MD 230; a preliminary",
        "finding would be useful input.",
        "",
        "No change to current messaging guidance. Continue current protocol.",
        "",
        "-- Office of the Signal Program, the Concord",
      ],
      "es-AR": [
        "CUARTEL GENERAL DEL CONCORD -- SOLICITUD DE ESTADO DE RUTINA",
        "",
        "Para: AION-7 / Dra. P. Anand-Kel",
        "",
        "Clasificación: RESTRINGIDO -- PROGRAMA DE SEÑAL",
        "",
        "MD 205 -- Según el cronograma vigente, por favor confirmá el estado",
        "del proceso de verificación de la sonda heredada. La junta de revisión",
        "del Cuartel General se reúne en el MD 230; un hallazgo preliminar",
        "sería un aporte útil.",
        "",
        "Sin cambios en los lineamientos de comunicación actuales. Continuá",
        "con el protocolo vigente.",
        "",
        "-- Oficina del Programa de Señal, el Concord",
      ],
    },
  },
  {
    id: "communications-incoming",
    from: { en: "UNREGISTERED SOURCE", "es-AR": "FUENTE NO REGISTRADA" },
    subject: { en: "[non-repeating fragment]", "es-AR": "[fragmento no repetitivo]" },
    timestamp: "MD 214",
    requires: [{ type: "flag", flag: "unknownTransmissionReceived", equals: true }],
    body: {
      en: [
        "INCOMING TRANSMISSION -- SOURCE UNREGISTERED",
        "",
        "Bearing: consistent with Tantalus",
        "",
        "Signal type: non-repeating (does not match Chorus Signal baseline)",
        "",
        "[fragment, partial decode]",
        "",
        '  "...still reading, Priya. Confirm null point recalibration,',
        '  please confirm..."',
        "",
        "[transmission ends]",
        "",
        "CASSIUS: Fragment does not match any outbound station log. Source and",
        "method of capture unconfirmed. Logging for review.",
      ],
      "es-AR": [
        "TRANSMISIÓN ENTRANTE -- FUENTE NO REGISTRADA",
        "",
        "Rumbo: coincide con Tántalo",
        "",
        "Tipo de señal: no repetitiva (no coincide con la línea base de la",
        "Señal del Coro)",
        "",
        "[fragmento, decodificación parcial]",
        "",
        '  "...sigo leyendo, Priya. Confirmá la recalibración del punto nulo,',
        '  por favor confirmá..."',
        "",
        "[fin de la transmisión]",
        "",
        "CASSIUS: El fragmento no coincide con ningún registro saliente de la",
        "estación. La fuente y el método de captura no están confirmados.",
        "Registrando para revisión.",
      ],
    },
  },
];
