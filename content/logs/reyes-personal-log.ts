import type { Localized } from "@/core/language";

/**
 * Reyes's own personal log. Reyes's gender is intentionally never specified (see
 * docs/lore/CHARACTERS.md) -- the Spanish text is written in Reyes's own first-person
 * voice, which sidesteps gendered third-person forms entirely.
 */
export const REYES_PERSONAL_LOG = {
  id: "reyes-personal-log",
  title: "PERSONAL LOG — SYSTEMS OFFICER REYES",
  body: {
    en: [
      "PERSONAL LOG -- SYSTEMS OFFICER REYES",
      "Access: Owner only",
      "",
      "MD 213 2340 -- Anand-Kel asked me to review the dish power draw curve",
      "again before shift change. Wouldn't say why. She's been like that for",
      "weeks -- asking questions like she already knows the answer and is just",
      "checking whether I'll get there too.",
      "",
      "Whatever's going on with the array, it's above my clearance. Not my",
      "first time being the last to know something on this station. Doesn't",
      "usually end well for anyone.",
      "",
      "Going off shift. Will pick this up in the morning.",
      "",
      "[LOG ENDS -- NEXT ENTRY: SYSTEM RECOVERY BOOT, SEE STATUS.LOG]",
    ],
    "es-AR": [
      "REGISTRO PERSONAL -- OFICIAL DE SISTEMAS REYES",
      "Acceso: Solo propietario/a",
      "",
      "MD 213 2340 -- Anand-Kel me pidió que revise otra vez la curva de",
      "consumo del plato antes del cambio de turno. No quiso decir por qué.",
      "Anda así hace semanas -- hace preguntas como si ya supiera la",
      "respuesta y solo estuviera comprobando si yo también llego a la misma.",
      "",
      "Lo que sea que esté pasando con la antena, está por encima de mi nivel",
      "de acceso. No es la primera vez que soy el último en enterarme de algo",
      "en esta estación. Nunca termina bien para nadie.",
      "",
      "Termino el turno. Sigo con esto mañana.",
      "",
      "[FIN DEL REGISTRO -- PRÓXIMA ENTRADA: ARRANQUE DE RECUPERACIÓN DEL",
      "SISTEMA, VER STATUS.LOG]",
    ],
  } satisfies Localized<string[]>,
};
