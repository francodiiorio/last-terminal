---
name: terminal-command
description: Create a new terminal command for Last Terminal's fake shell, following the existing parser/registry pattern and consistent syntax/error conventions. Use whenever adding or modifying a command under src/core/commands or src/game command registrations.
---

# Adding a terminal command

## Where it lives

- The command's logic: a `CommandDefinition` (see `docs/ARCHITECTURE.md`'s Commands section) registered with the command registry in `src/core/commands` or, if it needs game-specific data, in `src/game`.
- The command must NOT be added as a new branch in a UI component's if/else — the terminal UI only renders registry output.

## Definition shape

```ts
interface CommandDefinition {
  name: string;
  description: string;   // one line, shown by `help`
  usage: string;          // e.g. "cat <path>"
  unlockedByDefault: boolean;
  run: (ctx: CommandContext) => CommandResult;
}
```

## Conventions to follow (for consistency with existing commands)

- **Naming**: lowercase, single word, no abbimation past what's already established (`ls`, `cd`, `cat`, `power`, `whoami`, `status`, `help`, `clear`).
- **Errors**: consistent, terse, industrial phrasing — e.g. `"cat: no such file: <path>"`, `"ACCESS DENIED: <system> offline"` for power/flag-gated content, not generic exception text. Never leak a JS error message to the terminal output.
- **Gated commands/files**: check requirements (flags, power, unlocked state) and return an in-fiction denial message rather than pretending the thing doesn't exist, when the player has enough context to know it should be there (see `docs/GAME_DESIGN.md` — filesystem section).
- **Output**: return `string[]` (one entry per line) via `CommandResult.output` — don't embed ANSI/HTML in output; the terminal UI owns rendering/styling.
- **State changes**: perform them via `ctx.dispatch`, never by mutating state directly — this keeps commands testable as pure-ish functions given a context.
- **Side effects on the world**: if running the command should cost narrative time (see `docs/GAME_DESIGN.md` time table) or could satisfy event conditions, dispatch the time-advance / let the store's post-action event check run — don't hand-roll a special case.

## Process

1. Check `docs/ARCHITECTURE.md` and existing commands in `src/core/commands` for the current exact shape before adding a new one.
2. Write the `CommandDefinition`, register it.
3. Add/extend a unit test for the command's `run` behavior (success, error/gated case) — see `game-test` skill.
4. If the command should be locked until a story flag/unlock fires, wire that through an event action (`unlockCommand`), not a hardcoded condition inside the command itself.
