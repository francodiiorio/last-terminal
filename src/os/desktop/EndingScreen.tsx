import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { ENDINGS } from "@content/endings/endings";
import "./EndingScreen.css";

export default function EndingScreen() {
  const endingId = useGameStore((s) => s.story.endingId);
  const newGame = useGameStore((s) => s.newGame);
  const bootComplete = useGameStore((s) => s.bootComplete);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const ending = ENDINGS.find((e) => e.id === endingId);
  if (!ending) return null;

  function handleRestart() {
    newGame();
    bootComplete();
  }

  return (
    <div className="ending-screen" role="dialog" aria-label={ending.title}>
      <motion.div
        className="ending-screen__panel"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.05 : 0.3 }}
      >
        <h1 className="ending-screen__title">{ending.title}</h1>
        <div className="ending-screen__body">
          {ending.body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <button className="ending-screen__button" onClick={handleRestart}>
          Restart Session
        </button>
      </motion.div>
    </div>
  );
}
