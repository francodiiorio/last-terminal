import { useState } from "react";
import { useGameStore } from "@/store";
import { canEnable, headroomKw, isLocked, totalConsumptionKw } from "@/game/power/budget";
import { POWER_SYSTEMS, STATION_POWER_BUDGET_KW } from "@content/power/systems";
import { audioManager } from "@/audio/manager";
import "./PowerApp.css";

export default function PowerApp() {
  const powerSystems = useGameStore((s) => s.power.systems);
  const flags = useGameStore((s) => s.story.flags);
  const minutesElapsed = useGameStore((s) => s.time.minutesElapsed);
  const setPower = useGameStore((s) => s.setPower);
  const [deniedId, setDeniedId] = useState<string | null>(null);

  const world = { flags, power: powerSystems, minutesElapsed };
  const used = totalConsumptionKw(POWER_SYSTEMS, powerSystems);
  const headroom = headroomKw(STATION_POWER_BUDGET_KW, POWER_SYSTEMS, powerSystems);

  function handleToggle(systemId: string) {
    const system = POWER_SYSTEMS.find((s) => s.id === systemId);
    if (!system) return;
    const isOn = powerSystems[systemId] === "on";
    audioManager.play("powerToggle");

    if (isOn) {
      setPower(systemId, "off");
      setDeniedId(null);
      return;
    }
    if (!canEnable(system, POWER_SYSTEMS, powerSystems, STATION_POWER_BUDGET_KW, world)) {
      setDeniedId(systemId);
      return;
    }
    setDeniedId(null);
    setPower(systemId, "on");
  }

  return (
    <div className="power-app">
      <div className={`power-app__summary${headroom < 20 ? " power-app__summary--tight" : ""}`}>
        <span>ALLOCATED</span>
        <span>
          {used} / {STATION_POWER_BUDGET_KW} kW ({headroom} kW free)
        </span>
      </div>
      {POWER_SYSTEMS.map((system) => {
        const isOn = powerSystems[system.id] === "on";
        const locked = isLocked(system, world);
        return (
          <div className="power-row" key={system.id}>
            <div className="power-row__info">
              <span className="power-row__name">{system.name}</span>
              <span className="power-row__meta">
                {system.consumptionKw} kW -- {locked ? system.lockedReason : system.description}
              </span>
              {deniedId === system.id && !locked && (
                <span className="power-row__denied">INSUFFICIENT HEADROOM -- free up {system.consumptionKw} kW first</span>
              )}
            </div>
            <button
              className={`power-row__toggle${isOn ? " power-row__toggle--on" : ""}${locked ? " power-row__toggle--locked" : ""}`}
              onClick={() => handleToggle(system.id)}
              disabled={locked}
            >
              {locked ? "LOCKED" : isOn ? "ON" : "OFF"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
