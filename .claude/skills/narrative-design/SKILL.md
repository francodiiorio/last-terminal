---
name: narrative-design
description: Write narrative content (logs, emails, messages, character voice, clues) for Last Terminal that is coherent with the established lore. Use whenever creating or editing files under content/ (emails, logs, files, characters, endings) or docs/lore/.
---

# Narrative content authoring for Last Terminal

## Before writing anything

Read, in order:
1. `docs/lore/TIMELINE.md` — ground truth. Every fact you write must trace back to an event here, or you must add it here first (and flag that you did).
2. `docs/lore/MYSTERY.md` — what the player is allowed to know at this point, the discovery order, and the intentional red herrings/contradictions. New content must slot into this order, not leak ahead of it.
3. `docs/lore/CHARACTERS.md` — what each character (and CASSIUS) plausibly knows and how they speak.
4. `docs/lore/STATION.md` — setting/tone reference.

## Validation checklist before finishing a piece of content

- **Chronology**: does the in-universe date/timestamp fit `TIMELINE.md`? Don't invent a date without checking it doesn't contradict an existing entry.
- **Character knowledge**: would this character actually know this, at this point in the timeline? (Most crew are not read into the Chorus Signal's true nature until MD ~213 at the earliest — see TIMELINE.md.)
- **Discovery order**: does this content require the player to already know something they can't know yet, per `MYSTERY.md`'s discovery order?
- **Open threads**: does this content accidentally resolve one of `MYSTERY.md`'s "must stay open" items? If yes, stop — don't ship it without an explicit lore-doc update and a flag to the lead.
- **Contradiction intent**: if this content disagrees with another record, is that disagreement already listed in `MYSTERY.md`'s contradiction log? If it's a new intentional contradiction, add it there.
- **Voice**: CASSIUS = procedural, clipped, policy-flavored rather than sinister. Each crew member has a distinct register (blunt/practical for Lindqvist, precise/guarded for Anand-Kel, etc. — see CHARACTERS.md). Avoid uniform "narrator voice" across all documents.
- **Restraint**: station logs and personal journals should read like real working documents under pressure — specific, terse, occasionally mundane — not exposition dumps explaining the plot to the player.

## Data shape

Match whatever shape `game-architect` has established for the content type you're writing (email/log/file/event/character/ending) — check an existing example in `content/` first. If no shape exists yet for what you need, coordinate with `game-architect` rather than inventing your own.

## Output

Write directly to the appropriate `content/` file. Keep entries as short as they can be while doing their narrative job — don't pad.
