# ROADMAP.md

## Milestone 0 — Vertical slice (done)

The smallest playable end-to-end experience: boot → desktop → terminal → find the engineering log → discover the security archive is locked → make a real power tradeoff to power it → read a contradictory record → trigger a conditioned event → receive an unexpected message → clear demo-end screen. Shipped: docs, agents, skills, engine, OS shell, content, unit + E2E tests.

## Milestone 1 — Full power & filesystem systems (done)

- Communications and Laboratory now unlock through real command sequences rather than being permanently inert: `scan laboratory` clears Laboratory's structural seal; `diagnostic communications` then `route communications` repairs and unlocks Communications. Powering Communications (120kW) forces a genuine tradeoff — it only fits the budget with Life Support switched off, which fires a one-time critical warning. Navigation stays permanently locked by design (see `docs/lore/TIMELINE.md` — the station isn't under thrust in this arc; documented in `content/power/systems.ts`), so "all seven systems" means six with real consequences and one deliberately inert.
- Filesystem populated with the next tier of `docs/lore/TIMELINE.md` content: a station-wide deep-watch stasis status log (confirms Bakke's death without resolving the other four crew fates, per `docs/lore/MYSTERY.md`'s "must stay open" list), personnel files for the rest of the crew, Concord's correspondence revealing the cover-story directive (gated behind powering Communications), and an encrypted archive survey file revealing Tantalus's pre-station anomaly (gated behind powering Laboratory + `decrypt`).
- Camera app (GUI + `camera` terminal command) with three feeds; viewing the Sector C feed after the motion alert has fired pays off the red herring from the vertical slice with an in-fiction explanation (a structural sensor glitch, not an intruder).
- New terminal commands, all real: `scan`, `camera`, `decrypt`, `route`, `diagnostic`. Unlocked together once the player reads the first piece of evidence (the engineering log).

## Milestone 2 — Comms & CASSIUS

- Communications app (GUI): inbox/reader for correspondence beyond the single file added in Milestone 1, outbound drafts.
- CASSIUS becomes a legible in-fiction presence through more notifications and terminal responses reflecting its directive conflict, not just the handful of one-off lines shipped so far.

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
