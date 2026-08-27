import { useGameStore } from "@/store";
import { useStrings } from "@/i18n/useStrings";
import { LANGUAGES } from "@/core/language";
import { LANGUAGE_NAMES } from "@/i18n";
import "./SettingsApp.css";

export default function SettingsApp() {
  const t = useStrings();
  const volume = useGameStore((s) => s.settings.volume);
  const muted = useGameStore((s) => s.settings.muted);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);
  const language = useGameStore((s) => s.settings.language);
  const setVolume = useGameStore((s) => s.setVolume);
  const setMuted = useGameStore((s) => s.setMuted);
  const setReducedMotion = useGameStore((s) => s.setReducedMotion);
  const setLanguage = useGameStore((s) => s.setLanguage);

  return (
    <div className="settings-app">
      <div className="settings-row">
        <div className="settings-row__header">
          <span className="settings-row__label">{t.settings.audioVolumeLabel}</span>
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
          aria-label={t.settings.audioVolumeLabel}
        />
        <button
          className={`settings-toggle${muted ? " settings-toggle--on" : ""}`}
          onClick={() => setMuted(!muted)}
          aria-pressed={muted}
        >
          {muted ? t.settings.mutedButton : t.settings.muteButton}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row__header">
          <span className="settings-row__label">{t.settings.reducedMotionLabel}</span>
        </div>
        <span className="settings-row__meta">{t.settings.reducedMotionDescription}</span>
        <button
          className={`settings-toggle${reducedMotion ? " settings-toggle--on" : ""}`}
          onClick={() => setReducedMotion(!reducedMotion)}
          aria-pressed={reducedMotion}
        >
          {reducedMotion ? t.settings.onLabel : t.settings.offLabel}
        </button>
      </div>

      <div className="settings-row">
        <div className="settings-row__header">
          <span className="settings-row__label">{t.settings.languageLabel}</span>
        </div>
        <div className="settings-row__language-options" role="radiogroup" aria-label={t.settings.languageLabel}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              className={`settings-language-option${lang === language ? " settings-language-option--active" : ""}`}
              onClick={() => setLanguage(lang)}
              role="radio"
              aria-checked={lang === language}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
