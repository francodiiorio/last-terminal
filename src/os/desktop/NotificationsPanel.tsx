import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store";
import { audioManager } from "@/audio/manager";
import "./NotificationsPanel.css";

export default function NotificationsPanel() {
  const notifications = useGameStore((s) => s.station.notifications);
  const dismissNotification = useGameStore((s) => s.dismissNotification);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    for (const n of notifications) {
      if (seenIds.current.has(n.id)) continue;
      seenIds.current.add(n.id);
      audioManager.play(n.level === "critical" ? "warning" : "notification");
    }
  }, [notifications]);

  return (
    <div className="notifications" role="status" aria-live="polite" aria-atomic="false">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            className={`notification${n.level !== "info" ? ` notification--${n.level}` : ""}`}
            initial={reducedMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
            transition={{ duration: reducedMotion ? 0.05 : 0.18 }}
          >
            <span className="notification__message">{n.message}</span>
            <button
              className="notification__dismiss"
              onClick={() => dismissNotification(n.id)}
              aria-label="Dismiss notification"
            >
              x
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
