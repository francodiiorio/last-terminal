import { useEffect } from "react";
import { useGameStore } from "@/store";
import { initAutosave } from "@/persistence/autosave";
import BootScreen from "@/os/desktop/BootScreen";
import Desktop from "@/os/desktop/Desktop";
import EndingScreen from "@/os/desktop/EndingScreen";

export default function App() {
  const scene = useGameStore((s) => s.station.scene);
  const endingId = useGameStore((s) => s.story.endingId);

  useEffect(() => initAutosave(), []);

  return (
    <>
      {scene === "boot" ? <BootScreen /> : <Desktop />}
      {endingId && <EndingScreen />}
      <div className="crt-overlay" aria-hidden="true" />
    </>
  );
}
