import { AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store";
import { APP_REGISTRY } from "@/os/apps/registry";
import Window from "@/os/windows/Window";

export default function WindowManager() {
  const openIds = useGameStore((s) => s.apps.openIds);

  return (
    <AnimatePresence>
      {openIds.map((id) => {
        const def = APP_REGISTRY[id];
        if (!def) return null;
        return (
          <Window key={id} id={id} title={def.title} defaultPosition={def.defaultPosition}>
            {def.render()}
          </Window>
        );
      })}
    </AnimatePresence>
  );
}
