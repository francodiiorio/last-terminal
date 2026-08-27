import { useGameStore } from "@/store";
import "./SettingsApp.css";

export default function SettingsApp() {
  const volume = useGameStore((s) => s.settings.volume);
  const muted = useGameStore((s) => s.settings.muted);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);
  const setVolume = useGameStore((s) => s.setVolume);
  const setMuted = useGameStore((s) => s.setMuted);
  const setReducedMotion = useGameStore((s) => s.setReducedMotion);

  return (
    <div className="settings-app">
      <div className="settings-row">
        <div className="settings-row__header">
          <span className="settings-row__label">Audio Volume</span>
          <span className="settings-row__meta">{Math.round(volume * 100)}%</span>
        </div>
        <input
          className="settings-row__slider"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Audio volume"
        />
        <button
          className={`settings-toggle${muted ? " settings-toggle--on" : ""}`}
          onClick={() => setMuted(!muted)}
          aria-pressed={muted}
        >
          {muted ? "MUTED" : "MUTE"}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row__header">
          <span className="settings-row__label">Reduced Motion</span>
        </div>
        <span className="settings-row__meta">Shortens window/notification animations.</span>
        <button
          className={`settings-toggle${reducedMotion ? " settings-toggle--on" : ""}`}
          onClick={() => setReducedMotion(!reducedMotion)}
          aria-pressed={reducedMotion}
        >
          {reducedMotion ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
