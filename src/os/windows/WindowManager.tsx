import { AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store";
import { APP_REGISTRY, getAppTitle } from "@/os/apps/registry";
import { useStrings } from "@/i18n/useStrings";
import Window from "@/os/windows/Window";

export default function WindowManager() {
  const t = useStrings();
  const openIds = useGameStore((s) => s.apps.openIds);

  return (
    <AnimatePresence>
      {openIds.map((id) => {
        const def = APP_REGISTRY[id];
        if (!def) return null;
        return (
          <Window key={id} id={id} title={getAppTitle(t, id)} defaultPosition={def.defaultPosition}>
            {def.render()}
          </Window>
        );
      })}
    </AnimatePresence>
  );
}
