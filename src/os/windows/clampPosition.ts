import type { ViewportSize } from "@/os/windows/useViewportSize";

/** Used only before a window's real rendered width has been measured (see Window.tsx). */
export const HEADER_MIN_VISIBLE_PX = 160;
export const TASKBAR_CLEARANCE_PX = 72;
export const EDGE_MARGIN_PX = 8;

/**
 * Clamps a window's top-left so the whole window -- not just a fixed-size sliver of its header --
 * stays reachable on screen. `windowWidth` should be the element's actual rendered width when
 * known; a fixed fallback is used before first measurement (see HEADER_MIN_VISIBLE_PX).
 */
export function clampPosition(
  pos: { x: number; y: number },
  viewport: ViewportSize,
  windowWidth: number = HEADER_MIN_VISIBLE_PX,
): { x: number; y: number } {
  const maxX = Math.max(EDGE_MARGIN_PX, viewport.width - windowWidth - EDGE_MARGIN_PX);
  const maxY = Math.max(EDGE_MARGIN_PX, viewport.height - TASKBAR_CLEARANCE_PX);
  return {
    x: Math.min(Math.max(pos.x, EDGE_MARGIN_PX), maxX),
    y: Math.min(Math.max(pos.y, EDGE_MARGIN_PX), maxY),
  };
}
