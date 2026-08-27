---
name: game-design
description: Analyze or design a Last Terminal mechanic (power, time, unlocks, terminal interactions, camera, progression). Use when deciding how a new mechanic should work before writing code, or when evaluating whether an existing mechanic is pulling its weight.
---

# Game design analysis for Last Terminal

Use this skill before implementing a new mechanic, or when asked to evaluate one. It is a thinking checklist, not a code generator.

## Priorities, in order

1. **Interesting decisions.** Does this mechanic force a real tradeoff (not enough power for everything, limited time, irreversible-feeling choices)? If a mechanic never puts the player in a position where two good options compete, it's decoration — either sharpen it or cut it.
2. **Clarity.** Can the player understand the state and the consequence of their action from the OS itself (status readouts, terminal output, notifications) without external explanation? Prefer diegetic feedback (a system status changing, a log entry appearing) over UI-only feedback with no in-fiction anchor.
3. **Tension.** Does the mechanic sustain the game's quiet-dread tone (see `docs/PRODUCT.md`)? Avoid mechanics that introduce arcade-style urgency (countdown timers, twitch reactions) — tension here comes from consequence and scarcity, not reflexes.
4. **Replayability.** Would a second playthrough with different power/reading choices plausibly surface different content? Not required for every mechanic, but worth asking.
5. **Low accidental complexity.** Prefer the smallest mechanic that produces the tradeoff. Don't add a new state dimension (a new slice field, a new condition type) if an existing one (flags, power state, time) already expresses it.

## Process

1. Read `docs/GAME_DESIGN.md` and `docs/ARCHITECTURE.md` for what already exists — check whether the event/flag/power/time system already covers the need before proposing a new primitive.
2. State the tradeoff the mechanic creates, in one sentence. If you can't, the mechanic isn't ready to build.
3. Specify how it surfaces in the OS (which app/command/window) and what diegetic feedback confirms the player's choice landed.
4. Specify what content it depends on or unlocks (files, events, commands) so `narrative-designer` and `game-architect` know what's needed.
5. If it requires a new engine primitive (new condition/action type, new slice field), say so explicitly and route it through `game-architect` — this skill designs the mechanic, it doesn't redesign the engine schema unilaterally.

Keep proposals short: the tradeoff, the surface, the dependencies. Avoid writing a full spec document unless asked.
