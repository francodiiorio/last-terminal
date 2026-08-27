# ROADMAP.md

## Milestone 0 — Vertical slice (done)

The smallest playable end-to-end experience: boot → desktop → terminal → find the engineering log → discover the security archive is locked → make a real power tradeoff to power it → read a contradictory record → trigger a conditioned event → receive an unexpected message. Shipped: docs, agents, skills, engine, OS shell, content, unit + E2E tests. (Originally ended on a standalone "demo complete" screen; Milestone 3 replaced that with the real ending system — see below.)

## Milestone 1 — Full power & filesystem systems (done)

- Communications and Laboratory now unlock through real command sequences rather than being permanently inert: `scan laboratory` clears Laboratory's structural seal; `diagnostic communications` then `route communications` repairs and unlocks Communications. Powering Communications (120kW) forces a genuine tradeoff — it only fits the budget with Life Support switched off, which fires a one-time critical warning. Navigation stays permanently locked by design (see `docs/lore/TIMELINE.md` — the station isn't under thrust in this arc; documented in `content/power/systems.ts`), so "all seven systems" means six with real consequences and one deliberately inert.
- Filesystem populated with the next tier of `docs/lore/TIMELINE.md` content: a station-wide deep-watch stasis status log (confirms Bakke's death without resolving the other four crew fates, per `docs/lore/MYSTERY.md`'s "must stay open" list), personnel files for the rest of the crew, Concord's correspondence revealing the cover-story directive (gated behind powering Communications), and an encrypted archive survey file revealing Tantalus's pre-station anomaly (gated behind powering Laboratory + `decrypt`).
- Camera app (GUI + `camera` terminal command) with three feeds; viewing the Sector C feed after the motion alert has fired pays off the red herring from the vertical slice with an in-fiction explanation (a structural sensor glitch, not an intruder).
- New terminal commands, all real: `scan`, `camera`, `decrypt`, `route`, `diagnostic`. Unlocked together once the player reads the first piece of evidence (the engineering log).

## Milestone 2 — Comms & CASSIUS (done)

- Communications app (GUI): inbox reader (three messages: the MD 90 cover-story directive, a MD 205 routine status request, and the vertical slice's unknown transmission) plus two outbound draft templates (`routine-status-update`, `incident-report`) rather than free-text composition — sending is a real, data-driven choice, not narrative text the engine has to interpret. Reading a message via the app marks the same `read:<id>` flag `cat` does (both paths share one `content/emails/messages.ts` source), so GUI and terminal stay behaviorally identical.
- CASSIUS is now a legible presence beyond one-off lines: `/system/cassius-internal.log` is an off-the-record process note (gated behind Communications powered + having read the MD 90 correspondence) where CASSIUS documents its own directive conflict in its own procedural voice; finding it and sending the truthful incident report each draw a distinct one-time CASSIUS reaction event.
- Not done in this pass: a full send/receive simulation with delayed light-lag delivery — outbound drafts confirm immediately with in-fiction "ETA 6-14h" flavor text rather than actually delaying anything, since there's no real-time mechanic to hook it to (see Narrative time in `docs/GAME_DESIGN.md`).

## Milestone 3 — Endings (done)

- Implemented the `ending` action type in the event engine (`src/core/events/types.ts`, `game/engine.ts`), retiring the vertical slice's placeholder "demo complete" screen (`DemoEndScreen`) in favor of a real `EndingScreen` driven by `story.endingId`.
- Built the four endings from `docs/lore/ENDINGS.md` (Silence, Disclosure, Custodian, Resonance — `content/endings/endings.ts`) with legible, decision-driven trigger conditions: a provably mutually-exclusive/exhaustive partition over "sent the incident report," "read CASSIUS's internal note," and "left Life Support off for 40+ minutes" (`content/events/milestone3-events.ts`). Reaching the story's climax doesn't end the game by itself — it unlocks an explicit `conclude` command, so Milestone 1/2 content stays reachable until the player chooses to close the session.
- Deliberately continued to leave open the fates of Anand-Kel, Lindqvist, Faraday, and Idris, and the final transmission's origin — see the Milestone 3 notes added to `docs/lore/TIMELINE.md` and `docs/lore/MYSTERY.md`. None of the four endings assert an answer to either.

## Milestone 4 — Polish (done)

- **Audio**: replaced the silent placeholder library with a real one — every cue is synthesized procedurally at runtime (`src/audio/synth.ts`: oscillators + noise, WAV-encoded, played via Howler from Blob URLs) rather than a downloaded asset, since Fase 14's "no external/copyrighted material" constraint rules out sourcing files and no asset-generation tool was available. `src/audio/soundDefs.ts` holds the seven cue definitions; swapping in produced audio later means replacing that file's contents, nothing else. Added a Settings app (volume slider, mute, reduced motion) since those store actions previously had no UI.
- **Accessibility**: notifications are now an `aria-live="polite"` region (previously silent to screen readers); Power toggle buttons carry `aria-pressed`/`aria-label`; `EndingScreen` and `NotificationsPanel` respect `settings.reducedMotion` (previously only `BootScreen` and `Window` did). Deliberately not done: remappable keybindings — out of scope for the value it'd add versus the UI it requires; everything in the game is already keyboard-operable via real `<button>`/`<input>` elements, just not rebindable.
- **Save slots**: `persistence/save.ts` gained `listSaves`/`newManualSlot`/a `label` field on `SaveRecord`. The boot screen now lists every saved session (autosave and manual) with station time and a delete action instead of a single "Continue" button; the in-game Taskbar gained "Save As..." to create a new named manual slot alongside the existing continuous autosave.
- **Visual polish**: reviewed via screenshot across boot, desktop, Settings, and the save browser — legibility held up and the existing CRT overlay was already restrained, so no changes were made rather than adjusting it for its own sake.

## Post-Milestone-4 playtest fixes

An exploratory playthrough (edge-case commands, rapid power toggling, window drag/resize stress, a narrow viewport, keyboard-only interaction with the ending overlay) surfaced four real bugs, all fixed:

- **Howler format warnings on every generated sound.** Blob URLs have no file extension for Howler to infer a codec from; fixed by passing `format: ["wav"]` explicitly (`src/audio/manager.ts`).
- **Column misalignment in `power` and `camera` terminal output.** `padEnd(14)` produced zero padding (and so no visual gap) for ids at or past that length -- "communications" (14 chars) and "engineering-bay" (15 chars). Widened to `padEnd(16)`/`padEnd(17)`; regression-tested in `tests/unit/command-formatting.test.ts` by asserting every row's status column starts at the same index rather than pinning an exact width, so it can't silently regress the same way again.
- **Windows could render off-screen on narrow viewports**, unreachable even to close. `src/os/windows/clampPosition.ts` now clamps a window's position using its *actual measured rendered width* (`Window.tsx` measures via ref + `useLayoutEffect`, re-measuring when the viewport changes), not a fixed guess -- the first version of this fix used a flat 160px margin and still left wider windows' close buttons off-screen, which is what motivated measuring instead of guessing.
- **The Terminal power system had no consequence.** Every other power system gates something; toggling Terminal off did nothing. `store/index.ts`'s `runCommand` now refuses commands with an in-fiction message while Terminal power is off (the Power app GUI, which doesn't depend on it, remains a way back in).

Confirmed *not* bugs during the same pass: the ending overlay can't be bypassed by keyboard (Tab from "Restart Session" doesn't reach anything underneath, and typing while unfocused does nothing); no power-budget sequence produces a true softlock, since every allocation is reversible.

A second playthrough (GUI-driven this time: Camera/Comms app reactivity to power changes, multiple manual save slots, keyboard-only navigation, replaying to a second ending in one continuous session) found one more:

- **`power`'s arguments weren't case-insensitive, unlike `scan`/`camera`/`route`/`diagnostic`.** Those four commands lowercase their target argument; `power` didn't, so `power CAMERAS off` failed with "unknown system: CAMERAS" while the equivalent `SCAN LABORATORY` worked fine. Fixed by lowercasing both the system id and on/off action in `power`'s handler; regression-tested in `tests/unit/command-formatting.test.ts`.

Confirmed *not* bugs: Camera and Comms apps correctly go to their "offline" empty state live if their power system is switched off while the app is already open, with no stale content left showing; creating multiple named manual saves works correctly once each save's own confirmation is awaited (an artificial rapid-double-click race turned out to be untriggerable in practice, since `window.prompt` is a blocking modal -- a real second click can't land until the first prompt is dismissed); "Restart Session" and both "New Session" entry points intentionally skip the boot animation and go straight to the desktop, and correctly leave zero residual state (station time, power, flags) between playthroughs.

A user report ("I open a window and pressing the x doesn't close it") caught a real bug that no amount of automated `.click()`-based testing had surfaced, because Playwright's default click moves with zero jitter:

- **The window header's pointerdown handler captured the pointer unconditionally**, including presses that started on the close button (`src/os/windows/Window.tsx`). A real click's near-inevitable sub-pixel movement between press and release then registered as a micro-drag; with the pointer captured by the header, the browser resolved the resulting click's target to the header instead of the button underneath, so the button's `onClick` (and therefore `closeApp`) never fired. Fixed by skipping capture/drag-start entirely when the press originates on `.window__close`. Verified by reproducing the exact failure first (reverting the fix against a jitter-simulating test showed the window staying open, confirming the root cause) before confirming the fix resolves it -- `tests/e2e/window-interaction.spec.ts`, which also checks dragging by the title bar still works.

A third pass, prompted by that miss, deliberately went after realistic (not synthetic-perfect) interactions -- dragging to select terminal output text, off-screen drags with a proper animation-settle wait, focus/z-index handoff between overlapping windows -- and found one more:

- **Selecting terminal output text (e.g. to copy a log line) was immediately wiped out.** `TerminalApp`'s container refocused its input on any click to keep the shell feeling always-ready to type in; the mouseup that completes a text-selection drag also fires a click, so every selection was collapsed the instant it was made -- copying anything out of the terminal was effectively impossible. Fixed by skipping the refocus when `window.getSelection()` is non-empty. Confirmed the fix by first proving selection worked at all in the test environment (selecting plain, definitely-unblocked text on a bare page succeeded) before narrowing down to this component's own refocus-on-click as the specific cause -- `tests/e2e/terminal-selection.spec.ts`.

Two more things investigated and ruled out as real bugs on this pass, after appearing to fail at first: an off-screen window drag looked like it clamped to a negative `y`, but that was this session's own test reading the window's position before its open animation had settled, not the app -- a properly-sequenced check showed the clamp landing exactly on the intended minimum; and overlapping-window z-index handoff (bringing a background window to front by clicking its title) works correctly.

## Explicitly out of scope until named otherwise

- Any 3D/avatar movement.
- Multiplayer or any network dependency.
- Procedural/generated narrative content — everything is hand-authored data.
