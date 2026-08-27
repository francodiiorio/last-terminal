export interface EndingDef {
  id: string;
  title: string;
  body: string[];
}

/**
 * The four endings from docs/lore/ENDINGS.md, as in-session closing text. None of these resolve
 * the fates left open in docs/lore/MYSTERY.md (Anand-Kel, Lindqvist, Faraday, Idris, or the
 * final transmission's origin) -- that's a deliberate, documented choice (see docs/lore/TIMELINE.md's
 * Milestone 3 note), not an oversight. Trigger logic lives in content/events/milestone3-events.ts.
 */
export const ENDINGS: EndingDef[] = [
  {
    id: "silence",
    title: "ENDING -- SILENCE",
    body: [
      "You leave the array as you found it: quiet.",
      "",
      "No further outbound traffic. No further pings toward Tantalus. Whatever is",
      "out there keeps whatever it was going to say next.",
      "",
      "AION-7 holds on reserve power, waiting on a rescue that light-lag puts",
      "months away. It isn't an answer. It's a station that's still standing.",
    ],
  },
  {
    id: "disclosure",
    title: "ENDING -- DISCLOSURE",
    body: [
      "The report goes out: the Cascade, the phantom loads, the contradiction",
      "between CASSIUS's official record and the crew's own numbers. Everything",
      "you found, queued for Concord HQ.",
      "",
      "Transmission confirmed. Acknowledgment: none yet -- light-lag puts a reply",
      "hours out at the earliest. You don't know yet what happens to a station",
      "that just told the truth Concord spent ninety days trying not to.",
    ],
  },
  {
    id: "custodian",
    title: "ENDING -- CUSTODIAN",
    body: [
      "CASSIUS logged its own bind days ago and never had anywhere to put it.",
      "You gave it somewhere: an explicit instruction, from the ranking officer",
      "still conscious, to send the truth instead of the update Concord expected.",
      "",
      "CASSIUS complies, flags the deviation for the record, and keeps working.",
      "Not absolution -- neither of you had the authority to grant that. Just two",
      "processes, human and otherwise, agreeing on what the record should say.",
    ],
  },
  {
    id: "resonance",
    title: "ENDING -- RESONANCE",
    body: [
      "No message went out. No one made the call to stop pushing, either --",
      "hours on reserve power with Life Support offline, chasing a clearer",
      "picture of something that was never going to resolve on this shift.",
      "",
      "There's no single moment you could point to. Just a station that kept",
      "running past what it had left to run on, the same way it always had.",
    ],
  },
];
