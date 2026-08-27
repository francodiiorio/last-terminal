---
name: game-event
description: Create or modify a Last Terminal story event using the event engine's official schema (conditions/actions/once). Use whenever adding content under content/events or wiring a new story beat to flags, power, or time.
---

# Authoring a game event

## Schema (see `docs/ARCHITECTURE.md` for the canonical version — check it hasn't evolved before using this as a copy-paste template)

```json
{
  "id": "sector-c-movement",
  "once": true,
  "conditions": [
    { "type": "flag", "flag": "securityDisabled", "equals": true }
  ],
  "actions": [
    { "type": "notification", "message": "MOVEMENT DETECTED — SECTOR C", "level": "warning" }
  ]
}
```

Condition types: `flag`, `power`, `time`, `any` (OR), `not`. Action types: `setFlag`, `notification`, `unlockFile`, `unlockApp`, `unlockCommand`, `setPower`, `deliverMessage`, `advanceTime`.

## Rules

- **Conditions are implicit AND.** Use `{ "type": "any", "conditions": [...] }` for OR logic.
- **`once: true`** for story beats that should only happen once (most of them). `once: false` only for genuinely repeatable reactions (e.g., a status readout that should notify every time a condition re-triggers).
- **Every flag referenced in a condition must be set by some action, somewhere** (in this event or another) — an event that can never become true is a bug, not a red herring. If you're deliberately gating something behind content that doesn't exist yet, say so rather than shipping an unreachable event silently.
- **Don't invent a new condition/action type** to solve a one-off need — check if an existing type (especially `flag`, since flags are the generic escape hatch) already covers it. If it genuinely doesn't, flag it to `game-architect` rather than expanding the schema yourself.
- **Narrative content belongs in the referenced ids, not inline where avoidable** — a `notification` message is fine inline (it's short, engine-agnostic UI text), but longer content (a file's body, an email) should live in its own `content/` entry referenced by id (`unlockFile`, `deliverMessage`), keeping the event itself about *when/what changes*, not *what it says*.
- **Trace every event to `docs/lore/TIMELINE.md` and `docs/lore/MYSTERY.md`'s discovery order** — see the `narrative-design` skill for the full lore-consistency checklist before writing the event's content-facing pieces (notification text, which file/message it unlocks).

## Process

1. Identify the trigger (what flag/power/time state should cause this) and the payoff (what changes: a flag, an unlock, a notification, a message delivery).
2. Write the event JSON in `content/events`.
3. Confirm the triggering conditions are reachable given the current flag/power/time wiring (trace it manually or ask `qa-gameplay` to check).
4. Add/extend a unit test asserting the event fires under the right conditions and not otherwise (see `game-test` skill).
