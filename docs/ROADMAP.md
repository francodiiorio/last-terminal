# ROADMAP.md

## Milestone 0 — Vertical slice (current)

The smallest playable end-to-end experience: boot → desktop → terminal → find the engineering log → discover the security archive is locked → make a real power tradeoff to power it → read a contradictory record → trigger a conditioned event → receive an unexpected message → clear demo-end screen. Everything (docs, agents, skills, engine, OS shell, content, tests) needed to ship this is in scope now; nothing past it is.

## Milestone 1 — Full power & filesystem systems

- All seven power systems live with real consequences for each (not just Security).
- Full filesystem per `docs/lore/STATION.md` sectors, populated with the next tier of `docs/lore/TIMELINE.md` events (through Bakke's confirmed fate).
- Camera app with multiple feeds and a movement-detection event chain (paying off the Sector C red herring, per `docs/lore/MYSTERY.md`).
- More terminal commands: `scan`, `camera`, `decrypt`, `route`, `diagnostic`.

## Milestone 2 — Comms & CASSIUS

- Communications app: inbox, outbound drafts, Concord correspondence.
- CASSIUS becomes a legible in-fiction presence through notifications and terminal responses reflecting its directive conflict.
- Decrypt/route mechanics gate deeper archive material.

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
