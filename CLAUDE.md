# CLAUDE.md

## What this is

**Last Terminal** — a single-player, frontend-only mystery/exploration/resource-management game. The entire experience is a fictional space-station operating system (**TOS**, aboard station **AION-7**): desktop, terminal, filesystem, power grid, apps, notifications. No avatar, no 3D, no backend. See `docs/PRODUCT.md` for vision/pillars and `docs/GAME_DESIGN.md` for mechanics.

## Stack

React + TypeScript (strict) + Vite, Zustand (sliced store), Dexie.js (IndexedDB persistence), Framer Motion, Howler.js, Vitest + React Testing Library, Playwright.

## Commands

```
npm install
npm run dev        # local dev server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm test            # vitest
npm run test:e2e    # playwright
```

## Architecture in one paragraph

Three layers, one dependency direction: `src/core` (engine — pure TS, no narrative, no React) → `content/` (all narrative/balancing data, JSON/TS) → `src/os` + `src/components` (presentation, reads `src/store`, dispatches into `src/core`/`src/game`). Full detail: `docs/ARCHITECTURE.md`.

## Where things live

- `docs/PRODUCT.md` — vision, pillars, what this must NOT be.
- `docs/GAME_DESIGN.md` — core loop, power, time, terminal, filesystem, endings.
- `docs/ARCHITECTURE.md` — event schema, command schema, store slices, Dexie schema, testing strategy. **Read before touching `src/core` or `src/store`.**
- `docs/ROADMAP.md` — milestones; current milestone is the vertical slice.
- `docs/lore/` — the story bible. `TIMELINE.md` is ground truth; `MYSTERY.md` is what the player learns and when (kept deliberately separate). `CHARACTERS.md`, `STATION.md`, `ENDINGS.md` round it out. **Read before writing any narrative content.**

## Non-negotiable rules

- No backend, no Firebase/Supabase/SQL/Prisma/external services. Everything runs locally in-browser; persistence is Dexie only.
- Narrative content never lives inside engine or component code — it lives in `content/` and is loaded by data, not hardcoded strings driving logic.
- No single monolithic Zustand store — state is sliced by domain (station/power/story/filesystem/terminal/apps/time/settings).
- Story state is a generic flag bag (`Record<string, FlagValue>`), not one hardcoded boolean per feature.
- Events are declarative data matching the schema in `docs/ARCHITECTURE.md`, not imperative code paths.
- `docs/lore/TIMELINE.md` (what really happened) and `docs/lore/MYSTERY.md` (what the player discovers, in what order) must never silently drift apart — update both together.
- Don't resolve a "must stay open" mystery thread (see `docs/lore/MYSTERY.md`) in content without updating the lore docs first.
- Keep it as simple as the requirement allows — no enterprise abstraction, no speculative future-proofing.

## Subagents — when to use each

- **`game-architect`** — engine, state, event engine, persistence, command system, system integrity. Not narrative (beyond technical data shapes).
- **`ui-engineer`** — fake OS shell, windows, terminal visuals, animation, accessibility, responsiveness, camera/app UI. Never edits lore.
- **`narrative-designer`** — characters, messages, logs, clues, timeline-consistent content. Always reads `docs/lore/` first. Never changes engine decisions.
- **`qa-gameplay`** — softlocks, unreachable content, flag inconsistency, navigation bugs, regressions, narrative contradictions. No large refactors without the lead's sign-off.

Don't delegate for the sake of delegating — do the work directly when it's small or when splitting it across agents would risk inconsistent decisions (e.g., lore and architecture calls stay with the lead).

## Skills

`.claude/skills/`: `game-design`, `narrative-design`, `terminal-command`, `game-event`, `ui-system`, `game-test` — each owns one concern; see each skill's own file for specifics.

## Workflow for a non-trivial feature

1. Read the relevant doc(s) above.
2. Check existing architecture/content before adding new patterns.
3. Implement.
4. Run tests (`npm test`, and `npm run test:e2e` if it touches the playable flow).
5. Visually verify in the dev server if it touches UI.
6. Update docs if an architectural or narrative decision changed.
