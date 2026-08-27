import { describe, expect, it } from "vitest";
import { clampPosition, EDGE_MARGIN_PX, HEADER_MIN_VISIBLE_PX, TASKBAR_CLEARANCE_PX } from "@/os/windows/clampPosition";

describe("clampPosition", () => {
  it("leaves a position unchanged when it already fits the viewport", () => {
    expect(clampPosition({ x: 100, y: 100 }, { width: 1280, height: 720 }, 400)).toEqual({ x: 100, y: 100 });
  });

  it("pulls a window back on-screen on a narrow viewport using its real measured width (the reported bug)", () => {
    // Settings renders at roughly this width; a default x of 900 on a 390px-wide viewport
    // (phone-ish) previously left its close button ~185px past the right edge, unreachable.
    const windowWidth = 328;
    const viewport = { width: 390, height: 700 };
    const result = clampPosition({ x: 900, y: 460 }, viewport, windowWidth);
    expect(result.x + windowWidth).toBeLessThanOrEqual(viewport.width - EDGE_MARGIN_PX + 1e-9);
    expect(result.x).toBeGreaterThanOrEqual(EDGE_MARGIN_PX);
  });

  it("before the real width is measured, the fallback still keeps a usable sliver reachable", () => {
    const result = clampPosition({ x: 10000, y: 10000 }, { width: 320, height: 480 }, HEADER_MIN_VISIBLE_PX);
    expect(result.x).toBe(Math.max(EDGE_MARGIN_PX, 320 - HEADER_MIN_VISIBLE_PX - EDGE_MARGIN_PX));
    expect(result.y).toBe(Math.max(EDGE_MARGIN_PX, 480 - TASKBAR_CLEARANCE_PX));
  });

  it("never clamps below the edge margin, even on a tiny viewport", () => {
    const result = clampPosition({ x: -50, y: -50 }, { width: 100, height: 100 }, 200);
    expect(result.x).toBeGreaterThanOrEqual(EDGE_MARGIN_PX);
    expect(result.y).toBeGreaterThanOrEqual(EDGE_MARGIN_PX);
  });

  it("a window wider than the viewport still gets pinned to the left edge, not pushed negative", () => {
    const result = clampPosition({ x: 50, y: 50 }, { width: 300, height: 600 }, 500);
    expect(result.x).toBe(EDGE_MARGIN_PX);
  });
});
