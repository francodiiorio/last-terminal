import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { useViewportSize } from "@/os/windows/useViewportSize";
import { clampPosition, HEADER_MIN_VISIBLE_PX } from "@/os/windows/clampPosition";
import "./Window.css";

interface DragState {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

interface WindowProps {
  id: string;
  title: string;
  defaultPosition: { x: number; y: number };
  children: ReactNode;
}

export default function Window({ id, title, defaultPosition, children }: WindowProps) {
  const rawPosition = useGameStore((s) => s.apps.positions[id]) ?? defaultPosition;
  const focusedId = useGameStore((s) => s.apps.focusedId);
  const focusApp = useGameStore((s) => s.focusApp);
  const closeApp = useGameStore((s) => s.closeApp);
  const moveApp = useGameStore((s) => s.moveApp);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);
  const viewport = useViewportSize();
  const dragRef = useRef<DragState | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  // Fixed-size fallback until the element's real rendered width is measured post-mount --
  // narrower than any app's actual content, so it never under-clamps before that first measure.
  const [measuredWidth, setMeasuredWidth] = useState(HEADER_MIN_VISIBLE_PX);
  const isFocused = focusedId === id;

  // Re-measure whenever the viewport changes size, since the window's CSS max-width (and so its
  // rendered width) is itself a function of viewport width.
  useLayoutEffect(() => {
    if (elementRef.current) setMeasuredWidth(elementRef.current.offsetWidth);
  }, [viewport.width, viewport.height]);

  // Clamped for display (and as the drag-start reference) so a window -- its close button
  // included, not just a sliver of its header -- is never rendered somewhere unreachable.
  const position = clampPosition(rawPosition, viewport, measuredWidth);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    focusApp(id);
    // Don't start a drag (or capture the pointer) for presses on interactive controls in the
    // header, like the close button -- otherwise a real click's inevitable sub-pixel jitter
    // between pointerdown and pointerup registers as a micro-drag, the header (not the button)
    // ends up as the pointer-captured target, and the button's own click handler never fires.
    // Playwright's synthetic clicks move with zero jitter, which is why automated tests never
    // caught this: only real mouse/trackpad input triggers it.
    if ((e.target as HTMLElement).closest(".window__close")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: position.x, origY: position.y };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const next = { x: drag.origX + (e.clientX - drag.startX), y: drag.origY + (e.clientY - drag.startY) };
    moveApp(id, clampPosition(next, viewport, measuredWidth));
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <motion.div
      ref={elementRef}
      className={`window${isFocused ? " window--focused" : ""}`}
      style={{ left: position.x, top: position.y, zIndex: isFocused ? 50 : 10 }}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onMouseDown={() => focusApp(id)}
      role="dialog"
      aria-label={title}
    >
      <div
        className="window__header"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="window__title">{title}</span>
        <button className="window__close" onClick={() => closeApp(id)} aria-label={`Close ${title}`}>
          x
        </button>
      </div>
      <div className="window__body">{children}</div>
    </motion.div>
  );
}
