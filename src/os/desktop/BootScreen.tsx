import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { AUTOSAVE_SLOT, deleteSave, listSaves, loadGame } from "@/persistence/save";
import { deserializeSave } from "@/persistence/save";
import type { SaveRecord } from "@/persistence/db";
import { formatStationTime } from "@/core/time";
import { audioManager } from "@/audio/manager";
import { useStrings } from "@/i18n/useStrings";
import type { Strings } from "@/i18n";
import "./BootScreen.css";

function saveLabel(record: SaveRecord, t: Strings): string {
  if (record.label) return record.label;
  return record.slot === AUTOSAVE_SLOT ? t.boot.autosaveLabel : record.slot;
}

export default function BootScreen() {
  const t = useStrings();
  const newGame = useGameStore((s) => s.newGame);
  const bootComplete = useGameStore((s) => s.bootComplete);
  const loadSnapshot = useGameStore((s) => s.loadSnapshot);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const [phase, setPhase] = useState<"booting" | "menu">("booting");
  const [saves, setSaves] = useState<SaveRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function refreshSaves() {
    void listSaves().then(setSaves);
  }

  useEffect(() => {
    audioManager.play("systemBoot");
    refreshSaves();
    const delay = reducedMotion ? 50 : 1600;
    const timer = setTimeout(() => setPhase("menu"), delay);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  async function handleContinue(slot: string) {
    const snapshot = await loadGame(slot);
    if (!snapshot) {
      setError(t.boot.saveSlotNotFound);
      refreshSaves();
      return;
    }
    loadSnapshot(snapshot);
  }

  async function handleDelete(slot: string) {
    if (!window.confirm(t.boot.deleteConfirm)) return;
    await deleteSave(slot);
    refreshSaves();
  }

  function handleNewGame() {
    newGame();
    bootComplete();
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const snapshot = deserializeSave(text);
      loadSnapshot(snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message.toUpperCase() : t.boot.importFailed);
    }
  }

  return (
    <div className="boot-screen">
      <div className="boot-screen__lines">
        {t.boot.lines.map((line, i) => (
          <motion.p
            key={line}
            className={`boot-screen__line${i === 0 ? " boot-screen__line--accent" : ""}`}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reducedMotion ? 0 : i * 0.22, duration: 0.2 }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      {phase === "menu" && (
        <motion.div
          className="boot-screen__menu"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.3 }}
        >
          {saves.length > 0 && (
            <div className="boot-screen__saves">
              {saves.map((record) => (
                <div className="boot-screen__save-row" key={record.slot}>
                  <button className="boot-screen__button boot-screen__button--save" onClick={() => handleContinue(record.slot)}>
                    <span className="boot-screen__save-label">{saveLabel(record, t)}</span>
                    <span className="boot-screen__save-meta">
                      {formatStationTime(record.data.time.minutesElapsed)} {t.boot.stationTimeSuffix} -- {new Date(record.updatedAt).toLocaleString()}
                    </span>
                  </button>
                  <button
                    className="boot-screen__delete"
                    onClick={() => handleDelete(record.slot)}
                    aria-label={t.boot.deleteSaveAriaLabel(saveLabel(record, t))}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
          <button className="boot-screen__button" onClick={handleNewGame}>
            {t.boot.newSessionButton}
          </button>
          <button className="boot-screen__button" onClick={handleImportClick}>
            {t.boot.importButton}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="boot-screen__file-input"
            onChange={handleFileChange}
            aria-label={t.boot.importFileAriaLabel}
          />
          {error && <p className="boot-screen__error">{error}</p>}
        </motion.div>
      )}
    </div>
  );
}
