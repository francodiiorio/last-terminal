import type { Localized } from "@/core/language";

export interface EndingDef {
  id: string;
  title: Localized<string>;
  body: Localized<string[]>;
}

/**
 * The four endings from docs/lore/ENDINGS.md, as in-session closing text. None of these resolve
 * the fates left open in docs/lore/MYSTERY.md (Anand-Kel, Lindqvist, Faraday, Idris, or the
 * final transmission's origin) -- that's a deliberate, documented choice (see docs/lore/TIMELINE.md's
 * Milestone 3 note), not an oversight. Trigger logic lives in content/events/milestone3-events.ts.
 * Reyes's gender is intentionally never specified (see docs/lore/CHARACTERS.md) -- the Spanish
 * text avoids third-person gendered nouns referring to Reyes for that reason.
 */
export const ENDINGS: EndingDef[] = [
  {
    id: "silence",
    title: { en: "ENDING -- SILENCE", "es-AR": "FINAL -- SILENCIO" },
    body: {
      en: [
        "You leave the array as you found it: quiet.",
        "",
        "No further outbound traffic. No further pings toward Tantalus. Whatever is",
        "out there keeps whatever it was going to say next.",
        "",
        "AION-7 holds on reserve power, waiting on a rescue that light-lag puts",
        "months away. It isn't an answer. It's a station that's still standing.",
      ],
      "es-AR": [
        "Dejás la antena como la encontraste: en silencio.",
        "",
        "No hay más tráfico saliente. No hay más pings hacia Tántalo. Lo que sea",
        "que esté ahí afuera se queda con lo que fuera a decir después.",
        "",
        "AION-7 se mantiene con energía de reserva, esperando un rescate que el",
        "retraso lumínico ubica a meses de distancia. No es una respuesta. Es",
        "una estación que sigue en pie.",
      ],
    },
  },
  {
    id: "disclosure",
    title: { en: "ENDING -- DISCLOSURE", "es-AR": "FINAL -- REVELACIÓN" },
    body: {
      en: [
        "The report goes out: the Cascade, the phantom loads, the contradiction",
        "between CASSIUS's official record and the crew's own numbers. Everything",
        "you found, queued for Concord HQ.",
        "",
        "Transmission confirmed. Acknowledgment: none yet -- light-lag puts a reply",
        "hours out at the earliest. You don't know yet what happens to a station",
        "that just told the truth Concord spent ninety days trying not to.",
      ],
      "es-AR": [
        "El informe sale: la Cascada, las cargas fantasma, la contradicción",
        "entre el registro oficial de CASSIUS y los propios números de la",
        "tripulación. Todo lo que encontraste, en cola para el Cuartel General",
        "del Concord.",
        "",
        "Transmisión confirmada. Acuse de recibo: todavía ninguno -- el retraso",
        "lumínico ubica una respuesta a horas de distancia, como mínimo. Todavía",
        "no sabés qué le pasa a una estación que acaba de decir la verdad que",
        "el Concord pasó noventa días tratando de evitar.",
      ],
    },
  },
  {
    id: "custodian",
    title: { en: "ENDING -- CUSTODIAN", "es-AR": "FINAL -- CUSTODIO" },
    body: {
      en: [
        "CASSIUS logged its own bind days ago and never had anywhere to put it.",
        "You gave it somewhere: an explicit instruction, from the ranking officer",
        "still conscious, to send the truth instead of the update Concord expected.",
        "",
        "CASSIUS complies, flags the deviation for the record, and keeps working.",
        "Not absolution -- neither of you had the authority to grant that. Just two",
        "processes, human and otherwise, agreeing on what the record should say.",
      ],
      "es-AR": [
        "CASSIUS registró su propio dilema hace días y nunca tuvo dónde ponerlo.",
        "Vos le diste un lugar: una instrucción explícita tuya -- la única",
        "persona al mando que seguía consciente -- para enviar la verdad en",
        "lugar de la actualización que el Concord esperaba.",
        "",
        "CASSIUS obedece, marca la desviación para que quede registrada, y",
        "sigue trabajando. No es una absolución -- ninguno de los dos tenía",
        "autoridad para conceder eso. Solo dos procesos, humano y de otro tipo,",
        "de acuerdo sobre qué debería decir el registro.",
      ],
    },
  },
  {
    id: "resonance",
    title: { en: "ENDING -- RESONANCE", "es-AR": "FINAL -- RESONANCIA" },
    body: {
      en: [
        "No message went out. No one made the call to stop pushing, either --",
        "hours on reserve power with Life Support offline, chasing a clearer",
        "picture of something that was never going to resolve on this shift.",
        "",
        "There's no single moment you could point to. Just a station that kept",
        "running past what it had left to run on, the same way it always had.",
      ],
      "es-AR": [
        "Ningún mensaje salió. Tampoco nadie tomó la decisión de dejar de",
        "insistir -- horas con energía de reserva y el Soporte Vital fuera de",
        "línea, persiguiendo una imagen más clara de algo que nunca se iba a",
        "resolver en este turno.",
        "",
        "No hay un único momento que puedas señalar. Solo una estación que",
        "siguió funcionando más allá de lo que le quedaba para funcionar,",
        "igual que siempre lo había hecho.",
      ],
    },
  },
];
