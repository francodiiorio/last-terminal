# ROADMAP.md

## Milestone 0 — Vertical slice (done)

The smallest playable end-to-end experience: boot → desktop → terminal → find the engineering log → discover the security archive is locked → make a real power tradeoff to power it → read a contradictory record → trigger a conditioned event → receive an unexpected message. Shipped: docs, agents, skills, engine, OS shell, content, unit + E2E tests. (Originally ended on a standalone "demo complete" screen; Milestone 3 replaced that with the real ending system — see below.)

## Milestone 1 — Full power & filesystem systems (done)

- Communications and Laboratory now unlock through real command sequences rather than being permanently inert: `scan laboratory` clears Laboratory's structural seal; `diagnostic communications` then `route communications` repairs and unlocks Communications. Powering Communications (120kW) forces a genuine tradeoff — it only fits the budget with Life Support switched off, which fires a one-time critical warning. Navigation stays permanently locked by design (see `docs/lore/TIMELINE.md` — the station isn't under thrust in this arc; documented in `content/power/systems.ts`), so "all seven systems" means six with real consequences and one deliberately inert.
- Filesystem populated with the next tier of `docs/lore/TIMELINE.md` content: a station-wide deep-watch stasis status log (confirms Bakke's death without resolving the other four crew fates, per `docs/lore/MYSTERY.md`'s "must stay open" list), personnel files for the rest of the crew, Concord's correspondence revealing the cover-story directive (gated behind powering Communications), and an encrypted archive survey file revealing Tantalus's pre-station anomaly (gated behind powering Laboratory + `decrypt`).
- Camera app (GUI + `camera` terminal command) with three feeds; viewing the Sector C feed after the motion alert has fired pays off the red herring from the vertical slice with an in-fiction explanation (a structural sensor glitch, not an intruder).
- New terminal commands, all real: `scan`, `camera`, `decrypt`, `route`, `diagnostic`. Unlocked together once the player reads the first piece of evidence (the engineering log).

## Milestone 2 — Comms & CASSIUS (done)

- Communications app (GUI): inbox reader (three messages: the MD 90 cover-story directive, a MD 205 routine status request, and the vertical slice's unknown transmission) plus two outbound draft templates (`routine-status-update`, `incident-report`) rather than free-text composition — sending is a real, data-driven choice, not narrative text the engine has to interpret. Reading a message via the app marks the same `read:<id>` flag `cat` does (both paths share one `content/emails/messages.ts` source), so GUI and terminal stay behaviorally identical.
- CASSIUS is now a legible presence beyond one-off lines: `/system/cassius-internal.log` is an off-the-record process note (gated behind Communications powered + having read the MD 90 correspondence) where CASSIUS documents its own directive conflict in its own procedural voice; finding it and sending the truthful incident report each draw a distinct one-time CASSIUS reaction event.
- Not done in this pass: a full send/receive simulation with delayed light-lag delivery — outbound drafts confirm immediately with in-fiction "ETA 6-14h" flavor text rather than actually delaying anything, since there's no real-time mechanic to hook it to (see Narrative time in `docs/GAME_DESIGN.md`).

## Milestone 3 — Endings (done)

- Implemented the `ending` action type in the event engine (`src/core/events/types.ts`, `game/engine.ts`), retiring the vertical slice's placeholder "demo complete" screen (`DemoEndScreen`) in favor of a real `EndingScreen` driven by `story.endingId`.
- Built the four endings from `docs/lore/ENDINGS.md` (Silence, Disclosure, Custodian, Resonance — `content/endings/endings.ts`) with legible, decision-driven trigger conditions: a provably mutually-exclusive/exhaustive partition over "sent the incident report," "read CASSIUS's internal note," and "left Life Support off for 40+ minutes" (`content/events/milestone3-events.ts`). Reaching the story's climax doesn't end the game by itself — it unlocks an explicit `conclude` command, so Milestone 1/2 content stays reachable until the player chooses to close the session.
- Deliberately continued to leave open the fates of Anand-Kel, Lindqvist, Faraday, and Idris, and the final transmission's origin — see the Milestone 3 notes added to `docs/lore/TIMELINE.md` and `docs/lore/MYSTERY.md`. None of the four endings assert an answer to either.

## Milestone 4 — Polish (done)

- **Audio**: replaced the silent placeholder library with a real one — every cue is synthesized procedurally at runtime (`src/audio/synth.ts`: oscillators + noise, WAV-encoded, played via Howler from Blob URLs) rather than a downloaded asset, since Fase 14's "no external/copyrighted material" constraint rules out sourcing files and no asset-generation tool was available. `src/audio/soundDefs.ts` holds the seven cue definitions; swapping in produced audio later means replacing that file's contents, nothing else. Added a Settings app (volume slider, mute, reduced motion) since those store actions previously had no UI.
- **Accessibility**: notifications are now an `aria-live="polite"` region (previously silent to screen readers); Power toggle buttons carry `aria-pressed`/`aria-label`; `EndingScreen` and `NotificationsPanel` respect `settings.reducedMotion` (previously only `BootScreen` and `Window` did). Deliberately not done: remappable keybindings — out of scope for the value it'd add versus the UI it requires; everything in the game is already keyboard-operable via real `<button>`/`<input>` elements, just not rebindable.
- **Save slots**: `persistence/save.ts` gained `listSaves`/`newManualSlot`/a `label` field on `SaveRecord`. The boot screen now lists every saved session (autosave and manual) with station time and a delete action instead of a single "Continue" button; the in-game Taskbar gained "Save As..." to create a new named manual slot alongside the existing continuous autosave.
- **Visual polish**: reviewed via screenshot across boot, desktop, Settings, and the save browser — legibility held up and the existing CRT overlay was already restrained, so no changes were made rather than adjusting it for its own sake.

## Explicitly out of scope until named otherwise

- Any 3D/avatar movement.
- Multiplayer or any network dependency.
- Procedural/generated narrative content — everything is hand-authored data.
