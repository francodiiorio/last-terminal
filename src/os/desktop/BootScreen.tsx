import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { hasSave, loadGame, AUTOSAVE_SLOT } from "@/persistence/save";
import { deserializeSave } from "@/persistence/save";
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

export default function BootScreen() {
  const newGame = useGameStore((s) => s.newGame);
  const bootComplete = useGameStore((s) => s.bootComplete);
  const loadSnapshot = useGameStore((s) => s.loadSnapshot);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const [phase, setPhase] = useState<"booting" | "menu">("booting");
  const [canContinue, setCanContinue] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    audioManager.play("systemBoot");
    void hasSave(AUTOSAVE_SLOT).then(setCanContinue);
    const delay = reducedMotion ? 50 : 1600;
    const timer = setTimeout(() => setPhase("menu"), delay);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  async function handleContinue() {
    const snapshot = await loadGame(AUTOSAVE_SLOT);
    if (!snapshot) {
      setError("NO SAVED SESSION FOUND.");
      return;
    }
    loadSnapshot(snapshot);
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
            initial={{ opacity: 0 }}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <button className="boot-screen__button" onClick={handleContinue} disabled={!canContinue}>
            Continue
          </button>
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
