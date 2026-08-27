import { useGameStore } from "@/store";
import { formatStationTime } from "@/core/time";
import { headroomKw } from "@/game/power/budget";
import { POWER_SYSTEMS, STATION_POWER_BUDGET_KW } from "@content/power/systems";
import { serializeSave } from "@/persistence/save";
import "./Taskbar.css";

export default function Taskbar() {
  const minutesElapsed = useGameStore((s) => s.time.minutesElapsed);
  const powerSystems = useGameStore((s) => s.power.systems);
  const exportSnapshot = useGameStore((s) => s.exportSnapshot);
  const newGame = useGameStore((s) => s.newGame);
  const bootComplete = useGameStore((s) => s.bootComplete);

  const headroom = headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, powerSystems);
  const lowPower = headroom < 20;

  function handleExport() {
    const json = serializeSave(exportSnapshot());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `last-terminal-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (!window.confirm("Start a new session? Current progress will be overwritten.")) return;
    newGame();
    bootComplete();
  }

  return (
    <div className="taskbar">
      <span className="taskbar__brand">AION-7 / TOS</span>
      <div className="taskbar__meters">
        <span className={lowPower ? "taskbar__meter--warning" : undefined}>PWR {headroom} kW free</span>
        <span>{formatStationTime(minutesElapsed)}</span>
        <button className="taskbar__button" onClick={handleExport}>
          Export Save
        </button>
        <button className="taskbar__button" onClick={handleReset}>
          New Session
        </button>
      </div>
    </div>
  );
}
