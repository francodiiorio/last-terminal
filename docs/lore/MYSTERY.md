# MYSTERY.md — What The Player Discovers, And In What Order

This document tracks the player-facing epistemic state: what's known, hidden, contradictory, or false at each stage. It is the counterpart to `TIMELINE.md` (ground truth). Always update both together, and never let one silently drift from the other.

## The central secret

AION-7's crew was actively transmitting toward the Chorus Signal's source to provoke a clearer reply. The signal itself is best understood, once decoded, as an old, automated warning tied to resonance thresholds — not a hail. The station's own experiment has been approaching those thresholds for weeks. Concord classified the signal's likely non-terrestrial origin from the start and had CASSIUS maintain a "legacy probe" cover story to keep the science team's interpretation "clean" and morale stable — a decision made for research-integrity reasons, not malice, that nonetheless delayed the one corrective action (stop transmitting) that could have prevented the Cascade. Nothing aboard AION-7 is hostile. The danger is self-inflicted, physical, and rooted in institutional secrecy, not a monster or a hostile intelligence.

## What the player initially believes

- AION-7 suffered an unexplained accident or malfunction; Reyes is the first responder.
- CASSIUS's status reports are literally true.
- The station's official charter (listening + atmospheric research) is the whole story.
- Any "movement" or anomalous sensor readings imply an intruder or a survivor.

## Discovery order (vertical slice scope; full game extends this list)

1. **Engineering log (Lindqvist)** — introduces the "phantom load" contradiction: private log says unexplained power draw for weeks; CASSIUS's official system status insists everything was nominal over the same period. First crack in trust of official records.
2. **Security archive (locked, requires power tradeoff)** — once powered, contains an incident report logging a "movement detected" sensor alert in Sector C attributed at the time to personnel, later cross-referenced (by the player, not spelled out) against crew stasis logs showing no one should have been mobile there. Plants the false lead that someone is awake and moving — actually a mis-triggered hull-stress sensor (see red herrings).
3. **Player-triggered event** — disabling one system to power the security archive causes a real, in-fiction consequence (a further status change elsewhere), establishing that power decisions matter and are irreversible-feeling within a session.
4. **Unknown/unexpected message** — CASSIUS or an unlabeled source delivers a short transmission fragment that doesn't fit either the official cover story or what the player has pieced together so far. The vertical slice ends on this note deliberately unresolved.

## Red herrings (intentional, to be paid off or explicitly left open later — never accidental)

- **"Movement detected" alert (Sector C):** Reads like an intruder or a survivor moving through the station. Ground truth: a hull-stress sensor mis-triggering near the array mount, a side effect of the Cascade's structural damage. The game should let players suspect a survivor without confirming it.
- **Garbled comm fragment resembling Bakke's voice calling for help:** Raises false hope that Bakke survived. Ground truth: an old drill recording auto-replayed after a power surge corrupted a scheduling flag. Should be discoverable as false through a timestamp or metadata detail for players who dig, not stated outright.
- **Faraday's journal line about Concord "not wanting us to come home":** Written under stress and probable EM-linked sleep disruption in his last entries. Never confirmed true or false by any other source — keep it that way. It should feel paranoid, not obviously wrong.

## Contradictions to preserve (deliberate, load-bearing)

- CASSIUS's official system-status logs ("all systems nominal") vs. Lindqvist's private engineering log (phantom load, weeks of concern) and Idris's private medical log (EM exposure above safe margins). The pattern the player should learn: CASSIUS's public-facing records are curated/optimistic; personal crew logs are closer to raw truth. This pattern should recur enough times across content that it becomes a legible rule of the fiction, not a one-off gotcha.

## What must stay open past the vertical slice

- The fates of Anand-Kel, Lindqvist, Faraday, and Idris.
- The true nature/origin of the final anomalous transmission (mechanical echo vs. something else).
- Whether the Chorus Signal's source is inert wreckage or something that can still act.

Confirmed still open as of Milestone 3: the four endings (`content/endings/endings.ts`, see `TIMELINE.md`'s Milestone 3 note) resolve none of these — they're differentiated by player choices, not by revealing crew fates or the transmission's origin.

## Rule for narrative-designer content

Before writing any file under `content/`, read this document and `TIMELINE.md`. Any new clue must be traceable to a real event in `TIMELINE.md`; any contradiction must be listed here as intentional. If a piece of content would resolve one of the "must stay open" items above, stop and flag it instead of writing it — that's a decision for a dedicated narrative pass, not an incidental content addition.
