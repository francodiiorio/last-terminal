import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store";
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
  const position = useGameStore((s) => s.apps.positions[id]) ?? defaultPosition;
  const focusedId = useGameStore((s) => s.apps.focusedId);
  const focusApp = useGameStore((s) => s.focusApp);
  const closeApp = useGameStore((s) => s.closeApp);
  const moveApp = useGameStore((s) => s.moveApp);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);
  const dragRef = useRef<DragState | null>(null);
  const isFocused = focusedId === id;

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    focusApp(id);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: position.x, origY: position.y };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    moveApp(id, { x: drag.origX + (e.clientX - drag.startX), y: drag.origY + (e.clientY - drag.startY) });
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  return (
    <motion.div
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
