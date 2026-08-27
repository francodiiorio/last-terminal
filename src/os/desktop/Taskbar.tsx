import { useState } from "react";
import { useGameStore } from "@/store";
import { formatStationTime } from "@/core/time";
import { headroomKw } from "@/game/power/budget";
import { POWER_SYSTEMS, STATION_POWER_BUDGET_KW } from "@content/power/systems";
import { newManualSlot, saveGame, serializeSave } from "@/persistence/save";
import { useStrings } from "@/i18n/useStrings";
import "./Taskbar.css";

export default function Taskbar() {
  const t = useStrings();
  const minutesElapsed = useGameStore((s) => s.time.minutesElapsed);
  const powerSystems = useGameStore((s) => s.power.systems);
  const exportSnapshot = useGameStore((s) => s.exportSnapshot);
  const newGame = useGameStore((s) => s.newGame);
  const bootComplete = useGameStore((s) => s.bootComplete);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

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

  async function handleSaveAs() {
    const label = window.prompt(t.taskbar.saveAsPromptLabel, t.taskbar.saveAsPromptDefault(new Date().toLocaleString()));
    if (!label) return;
    await saveGame(newManualSlot(), exportSnapshot(), label);
    setSavedMessage(t.taskbar.savedAsMessage(label));
    setTimeout(() => setSavedMessage(null), 4000);
  }

  function handleReset() {
    if (!window.confirm(t.taskbar.resetConfirm)) return;
    newGame();
    bootComplete();
  }

  return (
    <div className="taskbar">
      <span className="taskbar__brand">{t.taskbar.brand}</span>
      <div className="taskbar__meters">
        {savedMessage && <span className="taskbar__saved-message">{savedMessage}</span>}
        <span className={lowPower ? "taskbar__meter--warning" : undefined}>{t.taskbar.pwrFree(headroom)}</span>
        <span>{formatStationTime(minutesElapsed)}</span>
        <button className="taskbar__button" onClick={handleSaveAs}>
          {t.taskbar.saveAsButton}
        </button>
        <button className="taskbar__button" onClick={handleExport}>
          {t.taskbar.exportButton}
        </button>
        <button className="taskbar__button" onClick={handleReset}>
          {t.taskbar.newSessionButton}
        </button>
      </div>
    </div>
  );
}
