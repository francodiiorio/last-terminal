# GAME_DESIGN.md

## Core loop

1. Read something (terminal output, a file, a notification).
2. Form a hypothesis about what it means or what to do next.
3. Act through the OS — run a command, open a file, reallocate power, open an app.
4. The world reacts — a flag flips, an event fires, a new file/app/command unlocks, a consequence lands.
5. Repeat with a slightly larger picture.

Nothing in the loop happens outside the OS. There is no separate map, inventory screen, or dialogue tree UI — everything is a window, a file, or terminal output.

## Energy

The station has a fixed power budget. Systems (Life Support, Terminal, Cameras, Communications, Security, Laboratory, Navigation — see `content/` for the authoritative list and numbers) each draw a fixed load and can be toggled on/off from the Power app or via the `power` terminal command. Total available power is less than the sum of every system's draw, so **the player can never run everything at once** — this is enforced, not just discouraged.

Consequences of power decisions are diegetic, not a stat penalty:
- Disabling Life Support fires a one-time critical warning notification the first time it goes offline (the `life-support-offline-warning` event) — there's no confirmation dialog blocking it; the tension comes from the consequence, not from friction. It's a real move players may need: Communications only fits the power budget with Life Support off.
- Enabling one system may require disabling another (insufficient headroom).
- Some files, commands, and apps are unreachable without specific systems powered (e.g., the security archive requires Security powered).
- Power state is one of the condition types the event engine can check, so the story can react to *which* systems the player chose to run, not just to time passing.

Power is never purely decorative: every slice-relevant power decision must gate or reveal something narrative.

## Narrative time

No real-world timers. An internal clock advances only in response to player actions (see `core/time`). Reference costs, tunable in content, not hardcoded in the engine:

| Action | Cost |
|---|---|
| Open camera feed | +1 min |
| Send a message | +2 min |
| Decrypt a file | +4 min |
| Scan a sector | +3 min |
| Reroute power | +3 min |
| Run a diagnostic | +6 min |
| Restart a system | +12 min |

Elapsed time is itself a condition type events can key off (e.g., "don't fire this event before minute 30"), so pacing is tunable purely through content.

## Terminal

A real command line, not a menu dressed as one. See `ARCHITECTURE.md` for the parser/command/UI separation. Always-available commands: `help`, `status`, `ls`, `cd`, `cat`, `clear`, `power`, `whoami`. Narratively-unlocked commands: `scan`, `camera`, `decrypt`, `route`, `diagnostic` — all five unlock together the first time the player reads the engineering log (`diagnostic-tools-unlocked` event), each tied to a real consequence (scan clears Laboratory's seal, diagnostic+route repairs and unlocks Communications, decrypt reveals the encrypted archive survey, camera resolves the Sector C red herring). Further commands are added as content, not engine changes — see the `terminal-command` skill.

## Filesystem

A declarative virtual filesystem (`content/files`) mirroring the station's structure (`system/`, `crew/`, `engineering/`, `communications/`, `security/`, `archive/` — see `docs/lore/STATION.md`). Each file/directory node can declare requirements (flags, power state, unlocked commands/apps) that gate visibility or readability. Reading a gated file without meeting requirements should fail with an in-fiction "ACCESS DENIED"-style error, not a silent absence, so the player learns something is there before they can reach it.

## Camera feed

A station app (plus the `camera` terminal command, reading the same `content/cameras/feeds.ts` data) showing text-based sensor readouts gated by the Cameras power system — no video assets, consistent with the station's low-bandwidth reserve-power state. Three feeds ship in Milestone 1: Sector C, Engineering Bay, Docking Bay. Viewing Sector C after the security-power motion alert has fired resolves that red herring in-fiction (a structural sensor glitch, not an intruder) via the `sector-c-explained` event.

## Unlocks

Everything that becomes available over time — commands, apps, files, power systems — unlocks through story flags and event actions, never through a separate "leveling" system. See `ARCHITECTURE.md` for the flag/event schema.

## Events

The event engine (`core/events`) is the single mechanism for "the world reacts." Events declare conditions (flag/power/time/etc. checks), a `once`/repeatable setting, and a list of actions (set flag, notify, unlock file/app/command, change power, send message, ...). Content authors add new story beats by adding event JSON, not by writing new React logic. See the `game-event` skill and `ARCHITECTURE.md`.

## Loss conditions

Last Terminal does not have a fail-and-restart death state in the traditional sense — there's no combat, no health bar. "Loss" is represented by the Resonance ending (see `docs/lore/ENDINGS.md`): mismanaging power/escalation leads to a bad-but-narratively-meaningful outcome, not a game-over screen asking to retry a checkpoint. The vertical slice does not implement any ending — it stops at an open narrative beat.

## Endings

Multiple narrative endings are designed in `docs/lore/ENDINGS.md` (Silence, Disclosure, Resonance, Custodian) and reached through accumulated player decisions (power allocation pattern, which records were pursued, cooperation with CASSIUS), not a single dialogue choice at the end. Endings are out of scope for the vertical slice.

## Progression

Progression is entirely about *access*, not stats: more of the station (files, apps, commands, power systems) becomes reachable as flags flip. There is no XP, inventory, or character build. The player's "power" grows in the literal sense (kW available/allocated) and the informational sense (what they've read and pieced together).
