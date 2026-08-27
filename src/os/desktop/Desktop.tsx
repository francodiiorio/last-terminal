import { useEffect } from "react";
import { useGameStore } from "@/store";
import { APP_REGISTRY } from "@/os/apps/registry";
import WindowManager from "@/os/windows/WindowManager";
import Taskbar from "@/os/desktop/Taskbar";
import NotificationsPanel from "@/os/desktop/NotificationsPanel";
import { audioManager } from "@/audio/manager";
import "./Desktop.css";

export default function Desktop() {
  const unlockedApps = useGameStore((s) => s.apps.unlockedIds);
  const openApp = useGameStore((s) => s.openApp);

  useEffect(() => {
    audioManager.play("ambient");
  }, []);

  return (
    <div className="desktop">
      <div className="desktop__surface">
        <div className="desktop__icons">
          {unlockedApps.map((id) => {
            const def = APP_REGISTRY[id];
            if (!def) return null;
            return (
              <button key={id} className="desktop-icon" onClick={() => openApp(id)}>
                <span className="desktop-icon__glyph" aria-hidden="true">
                  {def.icon}
                </span>
                <span className="desktop-icon__label">{def.title}</span>
              </button>
            );
          })}
        </div>
        <WindowManager />
        <NotificationsPanel />
      </div>
      <Taskbar />
    </div>
  );
}
