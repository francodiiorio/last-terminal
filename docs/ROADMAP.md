# ROADMAP.md

## Milestone 0 — Vertical slice (done)

The smallest playable end-to-end experience: boot → desktop → terminal → find the engineering log → discover the security archive is locked → make a real power tradeoff to power it → read a contradictory record → trigger a conditioned event → receive an unexpected message → clear demo-end screen. Shipped: docs, agents, skills, engine, OS shell, content, unit + E2E tests.

## Milestone 1 — Full power & filesystem systems (done)

- Communications and Laboratory now unlock through real command sequences rather than being permanently inert: `scan laboratory` clears Laboratory's structural seal; `diagnostic communications` then `route communications` repairs and unlocks Communications. Powering Communications (120kW) forces a genuine tradeoff — it only fits the budget with Life Support switched off, which fires a one-time critical warning. Navigation stays permanently locked by design (see `docs/lore/TIMELINE.md` — the station isn't under thrust in this arc; documented in `content/power/systems.ts`), so "all seven systems" means six with real consequences and one deliberately inert.
- Filesystem populated with the next tier of `docs/lore/TIMELINE.md` content: a station-wide deep-watch stasis status log (confirms Bakke's death without resolving the other four crew fates, per `docs/lore/MYSTERY.md`'s "must stay open" list), personnel files for the rest of the crew, Concord's correspondence revealing the cover-story directive (gated behind powering Communications), and an encrypted archive survey file revealing Tantalus's pre-station anomaly (gated behind powering Laboratory + `decrypt`).
- Camera app (GUI + `camera` terminal command) with three feeds; viewing the Sector C feed after the motion alert has fired pays off the red herring from the vertical slice with an in-fiction explanation (a structural sensor glitch, not an intruder).
- New terminal commands, all real: `scan`, `camera`, `decrypt`, `route`, `diagnostic`. Unlocked together once the player reads the first piece of evidence (the engineering log).

## Milestone 2 — Comms & CASSIUS (done)

- Communications app (GUI): inbox reader (three messages: the MD 90 cover-story directive, a MD 205 routine status request, and the vertical slice's unknown transmission) plus two outbound draft templates (`routine-status-update`, `incident-report`) rather than free-text composition — sending is a real, data-driven choice, not narrative text the engine has to interpret. Reading a message via the app marks the same `read:<id>` flag `cat` does (both paths share one `content/emails/messages.ts` source), so GUI and terminal stay behaviorally identical.
- CASSIUS is now a legible presence beyond one-off lines: `/system/cassius-internal.log` is an off-the-record process note (gated behind Communications powered + having read the MD 90 correspondence) where CASSIUS documents its own directive conflict in its own procedural voice; finding it and sending the truthful incident report each draw a distinct one-time CASSIUS reaction event.
- Not done in this pass: a full send/receive simulation with delayed light-lag delivery — outbound drafts confirm immediately with in-fiction "ETA 6-14h" flavor text rather than actually delaying anything, since there's no real-time mechanic to hook it to (see Narrative time in `docs/GAME_DESIGN.md`).

## Milestone 3 — Endings

- Implement the `endSlice`/ending action type in the event engine (deliberately deferred, see `docs/ARCHITECTURE.md`).
- Build the four endings from `docs/lore/ENDINGS.md` with legible, decision-driven trigger conditions.
- Resolve (or deliberately continue to leave open, with an explicit lore update) the fates of Anand-Kel, Lindqvist, Faraday, and Idris.

## Milestone 4 — Polish

- Full audio pass (replace placeholder-safe silent stubs with real assets).
- Accessibility pass (reduced motion, screen-reader-friendly terminal output, remappable/keyboard-only navigation).
- Save slot management beyond a single autosave (manual slots, save browser).
- Visual polish pass on CRT/scanline effects, informed by playtesting for legibility.

## Explicitly out of scope until named otherwise

- Any 3D/avatar movement.
- Multiplayer or any network dependency.
- Procedural/generated narrative content — everything is hand-authored data.
