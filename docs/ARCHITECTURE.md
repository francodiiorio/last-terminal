# ARCHITECTURE.md

## Guiding principle: data-driven, engine/content/UI separated

Three layers, one direction of dependency: **engine → content → UI** consumes both, content never imports UI, engine never imports content.

- `src/core/` — the engine. Pure TypeScript, no React, no game-specific narrative. Event evaluation, condition evaluation, command dispatch, the time clock. Fully unit-testable without rendering anything.
- `content/` — game-specific data (events, files, emails, logs, characters, endings, power system definitions) as typed JSON/TS data modules. This is where narrative and balancing live. Adding an event or a file should never require touching `src/core` or `src/os`.
- `src/game/` — thin glue that loads `content/` into the engine's shape (registers events, seeds the filesystem, defines power systems) and domain logic that isn't generic engine machinery (power budget rules, filesystem resolution).
- `src/os/` — the fake OS presentation layer: desktop, windows, terminal UI, apps. Reads from the store, dispatches actions/commands. No narrative strings live here beyond generic OS chrome ("ACCESS DENIED", window titles are data-driven where they represent content).
- `src/store/` — Zustand slices bridging engine/game state to React.
- `src/persistence/` — Dexie schema, save/load, export/import, migrations.

## Story flags

A single generic flag bag, not hardcoded booleans per feature:

```ts
type FlagValue = boolean | number | string;
type StoryFlags = Record<string, FlagValue>;
```

Accessed through `getFlag(flags, id)` / `flags` slice actions (`setFlag`, `setFlags`). Content and events reference flags by string id (e.g. `"foundEngineeringLog"`). No component should read `useStore(s => s.story.foundEngineeringLog)` directly with a hardcoded key baked into a type — flags are looked up by id so new ones never require a store code change.

## Event engine (`src/core/events`)

Declarative, JSON-shaped, content-authored. Shape (kept intentionally small; extend by adding condition/action variants, not by redesigning the shape):

```ts
interface GameEvent {
  id: string;
  once: boolean;           // default true; false = may refire whenever conditions hold again
  conditions: Condition[]; // implicit AND; use the "any" condition for OR
  actions: Action[];
}

type Condition =
  | { type: "flag"; flag: string; equals: FlagValue }
  | { type: "power"; system: string; state: "on" | "off" }
  | { type: "time"; minMinutes?: number; maxMinutes?: number }
  | { type: "any"; conditions: Condition[] }
  | { type: "not"; condition: Condition };

type Action =
  | { type: "setFlag"; flag: string; value: FlagValue }
  | { type: "notification"; message: string; level?: "info" | "warning" | "critical" }
  | { type: "unlockFile"; fileId: string }
  | { type: "unlockApp"; appId: string }
  | { type: "unlockCommand"; command: string }
  | { type: "setPower"; system: string; state: "on" | "off" }
  | { type: "deliverMessage"; messageId: string }
  | { type: "advanceTime"; minutes: number };
```

The engine's job is exactly two pure functions: `evaluateConditions(conditions, worldState): boolean` and `applyActions(actions, worldState): { worldState, effects }`. A thin `runEventCheck(events, worldState, firedOnceIds)` scans all events after any state-changing action, evaluates conditions, and applies actions for newly-satisfied `once` events (and every satisfied repeatable event). This runs after every store mutation that could affect conditions (flag change, power change, time advance), not on a polling timer.

`endSlice`/ending-triggering actions are intentionally omitted from the v1 action union — the vertical slice ends on an open narrative beat, not a scored ending. Add an ending action type when `docs/lore/ENDINGS.md` content actually ships.

## Commands (`src/core/commands` + `src/game` registrations)

```ts
interface CommandContext {
  args: string[];
  raw: string;
  getState: () => GameState; // read-only snapshot
  dispatch: (action: GameAction) => void; // e.g. setFlag, setPower, navigate fs, print
}
interface CommandResult { output: string[]; }
interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  unlockedByDefault: boolean;
  run: (ctx: CommandContext) => CommandResult;
}
```

Commands are registered in a `CommandRegistry` (a Map), looked up by name at parse time. The terminal UI never contains command logic — it only feeds parsed input to the registry and renders the returned output lines. New commands (`scan`, `camera`, `decrypt`, `route`, `diagnostic`) are added by registering a new `CommandDefinition`, never by extending a growing `if/else`/`switch` in a component. See the `terminal-command` skill.

Parsing is a separate pure function: `parseCommandLine(input: string): { name: string; args: string[] }`, independent of the registry and the UI, unit-tested on its own.

## State: Zustand slices

No monolithic store. One store composed of independent slice creators, each owning one domain, combined with Zustand's slice pattern:

- `stationSlice` — station-level meta state (current scene: boot/desktop, alerts).
- `powerSlice` — power system definitions' runtime state (on/off, budget, consumption) and the calculation of available headroom.
- `storySlice` — the flag bag and event `firedOnceIds`.
- `filesystemSlice` — which files/dirs are unlocked/read, current terminal working directory.
- `terminalSlice` — command history, output buffer, unlocked commands.
- `appsSlice` — which OS apps are unlocked/open/focused, window positions.
- `timeSlice` — narrative clock (minutes elapsed).
- `settingsSlice` — audio volume, accessibility toggles, reduced-motion.

Each slice exposes its own actions; cross-slice effects (e.g., a power toggle triggering an event check that unlocks a file) are coordinated by a small `engine` layer (`src/game/engine.ts`) that slices call into, not by slices importing each other directly. This keeps each slice testable in isolation and keeps "what happens when X changes" in one legible place.

## Persistence (Dexie)

One Dexie database, two tables:

```ts
db.version(1).stores({
  saves: "&slot, updatedAt",   // slot: "autosave" | "manual-<n>"
  meta: "&key",                // settings, schemaVersion bookkeeping
});
```

A save record is a single versioned snapshot:

```ts
interface SaveGameV1 {
  schemaVersion: 1;
  slot: string;
  updatedAt: number;
  story: { flags: StoryFlags; firedOnceIds: string[] };
  power: { systems: Record<string, { on: boolean }> };
  filesystem: { unlockedIds: string[]; readIds: string[] };
  apps: { unlockedIds: string[] };
  terminal: { unlockedCommands: string[]; history: string[] };
  time: { minutesElapsed: number };
  settings: { volume: number; reducedMotion: boolean };
}
```

`schemaVersion` is checked on load; a `migrations/` module maps `vN -> vN+1` so old saves keep working as the shape evolves. Export/import serialize/parse this exact object as JSON (human-readable, no binary encoding), so "export save" and "the Dexie row" are the same shape. Autosave subscribes to the store (debounced) and writes to the `"autosave"` slot; "new game" resets the store to initial slice state and clears/overwrites the autosave; "continue" loads the latest save; manual export/import work off the same serializer so they can never drift from what autosave produces.

## Testing

- **Unit (Vitest):** `core/events` condition/action evaluation, `core/commands` parser, power budget math (`game/power`), filesystem path resolution (`game/filesystem`), save serialization and migrations. These are pure functions — no rendering needed for most of them.
- **Component (React Testing Library):** terminal input/output rendering, window open/close/focus behavior, power app toggle interaction — enough to catch regressions in the interactive OS chrome, not exhaustive coverage of every app.
- **E2E (Playwright):** one full vertical-slice run — new game → terminal → find the first file → change power allocation → unlock content → trigger the slice's final event — asserting the slice is completable end to end in a real browser against IndexedDB-backed persistence.

## Notable decisions worth flagging here (rather than re-deciding silently later)

- **No `endSlice`/ending action type yet.** Endings are designed in lore but intentionally not wired into the event action union until ending content actually ships, to avoid a half-built branch structure.
- **Flags are a flat string-keyed bag**, not a typed union of known keys. This trades some compile-time safety for the "no narrative decisions hardcoded in engine/components" requirement — content can introduce new flags without touching TypeScript types. Typos are caught by tests that assert every flag referenced in `content/events` is set by at least one action somewhere (a `qa-gameplay`-owned invariant, not a compiler guarantee).
- **CASSIUS's "curated vs. raw" record pattern (see `docs/lore/MYSTERY.md`) has no special engine support.** It's achieved entirely through content (two files disagreeing), not a "trust level" system — keeping the engine narrative-agnostic.
