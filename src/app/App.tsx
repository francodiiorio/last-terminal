import { useEffect } from "react";
import { useGameStore } from "@/store";
import { initAutosave } from "@/persistence/autosave";
import BootScreen from "@/os/desktop/BootScreen";
import Desktop from "@/os/desktop/Desktop";
import DemoEndScreen from "@/os/desktop/DemoEndScreen";

export default function App() {
  const scene = useGameStore((s) => s.station.scene);
  const transmissionRead = useGameStore((s) => s.story.flags["read:communications-incoming"] === true);

  useEffect(() => initAutosave(), []);

  return (
    <>
      {scene === "boot" ? <BootScreen /> : <Desktop />}
      {transmissionRead && <DemoEndScreen />}
      <div className="crt-overlay" aria-hidden="true" />
    </>
  );
}
