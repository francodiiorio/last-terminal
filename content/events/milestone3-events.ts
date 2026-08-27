import type { GameEvent } from "@/core/events/types";

/**
 * Milestone 3 event chain (see docs/ROADMAP.md): the four endings from docs/lore/ENDINGS.md.
 *
 * Endings are deliberately NOT triggered automatically by reaching the story's climax --
 * `conclude-command-unlocked` only unlocks the `conclude` command once the player has read the
 * unknown transmission, and running it is what actually sets `sessionConcluding`. This keeps
 * Milestone 1/2 content (Communications repair, the Camera app, the Comms inbox and drafts)
 * fully reachable after the transmission arrives, instead of the session ending the moment it
 * does.
 *
 * The four ending events are mutually exclusive and exhaustive by construction, built from two
 * binary signals once `sessionConcluding` is true:
 *   A = sentIncidentReport (told Concord the truth instead of the routine update)
 *   B = read:cassius-internal-note (understood CASSIUS's own directive conflict)
 *   C = sustained risk-taking (Life Support left off for 40+ minutes of station time)
 * Custodian = A∧B, Disclosure = A∧¬B, Resonance = ¬A∧C, Silence = ¬A∧¬C. Any future change to
 * these conditions must preserve that partition -- see tests/unit/milestone3-endings.test.ts.
 */
export const MILESTONE3_EVENTS: GameEvent[] = [
  {
    id: "conclude-command-unlocked",
    once: true,
    conditions: [{ type: "flag", flag: "read:communications-incoming", equals: true }],
    actions: [
      { type: "unlockCommand", command: "conclude" },
      {
        type: "notification",
        message: "Enough is on the record to close this session. Run 'conclude' when ready.",
        level: "info",
      },
    ],
  },
  {
    id: "ending-custodian",
    once: true,
    conditions: [
      { type: "flag", flag: "sessionConcluding", equals: true },
      { type: "flag", flag: "sentIncidentReport", equals: true },
      { type: "flag", flag: "read:cassius-internal-note", equals: true },
    ],
    actions: [{ type: "ending", endingId: "custodian" }],
  },
  {
    id: "ending-disclosure",
    once: true,
    conditions: [
      { type: "flag", flag: "sessionConcluding", equals: true },
      { type: "flag", flag: "sentIncidentReport", equals: true },
      { type: "not", condition: { type: "flag", flag: "read:cassius-internal-note", equals: true } },
    ],
    actions: [{ type: "ending", endingId: "disclosure" }],
  },
  {
    id: "ending-resonance",
    once: true,
    conditions: [
      { type: "flag", flag: "sessionConcluding", equals: true },
      { type: "not", condition: { type: "flag", flag: "sentIncidentReport", equals: true } },
      { type: "power", system: "life-support", state: "off" },
      { type: "time", minMinutes: 40 },
    ],
    actions: [{ type: "ending", endingId: "resonance" }],
  },
  {
    id: "ending-silence",
    once: true,
    conditions: [
      { type: "flag", flag: "sessionConcluding", equals: true },
      { type: "not", condition: { type: "flag", flag: "sentIncidentReport", equals: true } },
      {
        type: "any",
        conditions: [
          { type: "power", system: "life-support", state: "on" },
          { type: "not", condition: { type: "time", minMinutes: 40 } },
        ],
      },
    ],
    actions: [{ type: "ending", endingId: "silence" }],
  },
];
