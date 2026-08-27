---
name: ui-system
description: Keep visual and interaction design consistent across Last Terminal's fake OS (windows, terminal, apps, notifications). Use when building or modifying any component under src/os or src/components, or when reviewing UI work for consistency.
---

# UI system consistency for Last Terminal

## Reference

Read `docs/PRODUCT.md`'s tone notes and `docs/lore/STATION.md`'s tone notes before styling anything new. The station "was built to work, not to look impressive," and has been quietly failing for weeks.

## Visual rules

- **No SaaS-dashboard defaults**: avoid rounded cards as the default container, avoid gradients, avoid soft drop shadows used decoratively. Prefer flat panels, hard or minimal-radius edges, monospace/technical typography for data-dense areas.
- **Dark, legible, minimal.** High enough contrast to read comfortably for the whole session. Legibility beats atmosphere every time there's a conflict.
- **Restrained CRT/scanline/glitch effects.** Fine as texture (subtle scanline overlay, occasional flicker on boot or under stress), never so strong they impair reading terminal output. If an effect makes text harder to read, it's too strong.
- **Consistent chrome**: windows, taskbar/dock equivalent, notification style, and the clock/power indicator should share one visual language (same border treatment, same type scale, same color tokens) — don't let each app invent its own look.
- **Color as signal**: reserve warning/critical colors (amber/red-adjacent, chosen to stay legible, not neon) for actual in-fiction alerts, not decoration — if everything looks urgent, nothing does.

## Interaction rules

- **Windows behave convincingly**: draggable, focusable (bring-to-front on click), closable, and their state (position, open/closed) persists through the `apps` store slice — don't let window state live only in local component state if it needs to survive a save/reload.
- **Keyboard-first terminal**: full keyboard operability, sensible history navigation (up/down arrows), autoscroll on new output.
- **Motion**: Framer Motion for window open/close/focus transitions and notification entrances — short, purposeful, respecting the `settings.reducedMotion` flag (skip/shorten animation when set).
- **Accessibility**: sufficient contrast, focus-visible states, ARIA-sane structure for terminal output (e.g., a live region for new lines), no interaction that's mouse-only.

## Process

1. Check `src/styles` design tokens (colors, spacing, type scale) before introducing new ad hoc values — extend the token set if something is genuinely missing, don't hardcode a one-off.
2. Build the component, wire it to the relevant store slice — don't hold state locally that needs to persist.
3. Verify in the running dev server, including a reduced-motion check and a keyboard-only pass for anything interactive.
4. Don't touch `content/` or `docs/lore/` from here — narrative copy is consumed, not authored, in this skill's scope.
