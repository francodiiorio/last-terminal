---
name: game-test
description: Validate Last Terminal's event branches, flag states, and playable flows — write or run unit/component/E2E tests, or manually trace a scenario for softlocks and unreachable content. Use after adding events, commands, power systems, or content, and before considering such work done.
---

# Validating Last Terminal

## What to test, and at which layer

- **Unit (Vitest)** — pure logic in `src/core` and `src/game`: event condition/action evaluation, command parsing, power budget math, filesystem path resolution, save serialization/migration. Default choice for engine and content-shape correctness; fast and precise.
- **Component (RTL)** — interactive OS chrome: terminal input/output, window focus/drag/close, power toggle interactions. Use when the bug/feature is about DOM behavior, not pure logic.
- **E2E (Playwright)** — full playable flows through a real browser with real IndexedDB persistence. Use for "can the player actually get from A to B" questions, and for the vertical-slice completion guarantee.

## Event/flag validation checklist

For any new or changed event in `content/events`:
1. Every flag it reads is set by some action, somewhere (grep `content/events` for `setFlag`/`unlockFile`/etc. to confirm).
2. The event fires when conditions are met and does not fire when they aren't (write both cases as unit tests where feasible).
3. `once` events don't refire on repeated condition checks; repeatable events behave as intended.
4. Trace the event's preconditions back through the flow that's supposed to reach them — is there an actual player path to satisfy the conditions in the vertical slice? If not, it's a dead/unreachable event.

## Scenario tracing for softlocks

Manually (or via a script) walk power allocation states: is there always at least one valid configuration that lets the player reach the next required unlock? A softlock is any reachable state from which no sequence of allowed actions can progress the story.

## Save integrity

- Export a save, import it into a reset store, confirm identical resulting state.
- "New game" fully clears prior flags/power/time — check for leaked state from a previous session (a common source of "impossible state" bugs).
- If the schema version changed, confirm the migration path from the previous version's save shape.

## Process

1. Identify which layer(s) the change needs coverage at (see above) — don't write an E2E test for something a unit test already covers faster and more precisely.
2. Write/update tests alongside the change, not as an afterthought.
3. Run `npm test` and, for playable-flow changes, `npm run test:e2e`.
4. Report failures with the specific flag/event/command id and the expected vs. actual behavior — precise enough that `game-architect` or `narrative-designer` can act without re-deriving the problem.
