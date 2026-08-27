import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { AUTOSAVE_SLOT, deleteSave, listSaves, loadGame } from "@/persistence/save";
import { deserializeSave } from "@/persistence/save";
import type { SaveRecord } from "@/persistence/db";
import { formatStationTime } from "@/core/time";
import { audioManager } from "@/audio/manager";
import "./BootScreen.css";

const BOOT_LINES = [
  "AION-7 :: TERMINAL OPERATING SYSTEM",
  "TOS v4.1.2 -- RESERVE POWER MODE",
  "INITIALIZING CORE SERVICES...",
  "CASSIUS PROCESS -- ACTIVE",
  "SYSTEMS OFFICER REYES -- STASIS CYCLE COMPLETE",
  "AWAITING INPUT",
];

function saveLabel(record: SaveRecord): string {
  if (record.label) return record.label;
  return record.slot === AUTOSAVE_SLOT ? "Autosave" : record.slot;
}

export default function BootScreen() {
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
      setError("SAVE SLOT NOT FOUND.");
      refreshSaves();
      return;
    }
    loadSnapshot(snapshot);
  }

  async function handleDelete(slot: string) {
    if (!window.confirm("Delete this saved session? This can't be undone.")) return;
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
      setError(err instanceof Error ? err.message.toUpperCase() : "IMPORT FAILED.");
    }
  }

  return (
    <div className="boot-screen">
      <div className="boot-screen__lines">
        {BOOT_LINES.map((line, i) => (
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
                    <span className="boot-screen__save-label">{saveLabel(record)}</span>
                    <span className="boot-screen__save-meta">
                      {formatStationTime(record.data.time.minutesElapsed)} station time -- {new Date(record.updatedAt).toLocaleString()}
                    </span>
                  </button>
                  <button
                    className="boot-screen__delete"
                    onClick={() => handleDelete(record.slot)}
                    aria-label={`Delete save ${saveLabel(record)}`}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
          <button className="boot-screen__button" onClick={handleNewGame}>
            New Session
          </button>
          <button className="boot-screen__button" onClick={handleImportClick}>
            Import Save File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="boot-screen__file-input"
            onChange={handleFileChange}
            aria-label="Import save file"
          />
          {error && <p className="boot-screen__error">{error}</p>}
        </motion.div>
      )}
    </div>
  );
}
