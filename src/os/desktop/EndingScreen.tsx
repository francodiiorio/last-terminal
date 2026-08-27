import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { pick } from "@/core/language";
import { ENDINGS } from "@content/endings/endings";
import { useStrings } from "@/i18n/useStrings";
import "./EndingScreen.css";

export default function EndingScreen() {
  const t = useStrings();
  const language = useGameStore((s) => s.settings.language);
  const endingId = useGameStore((s) => s.story.endingId);
  const newGame = useGameStore((s) => s.newGame);
  const bootComplete = useGameStore((s) => s.bootComplete);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const ending = ENDINGS.find((e) => e.id === endingId);
  if (!ending) return null;

  const title = pick(ending.title, language);
  const body = pick(ending.body, language);

  function handleRestart() {
    newGame();
    bootComplete();
  }

  return (
    <div className="ending-screen" role="dialog" aria-label={title}>
      <motion.div
        className="ending-screen__panel"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.05 : 0.3 }}
      >
        <h1 className="ending-screen__title">{title}</h1>
        <div className="ending-screen__body">
          {body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <button className="ending-screen__button" onClick={handleRestart}>
          {t.ending.restartButton}
        </button>
      </motion.div>
    </div>
  );
}
