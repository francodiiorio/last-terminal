import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { pick } from "@/core/language";
import { paragraphsFrom } from "@/core/text";
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
  const restartButtonRef = useRef<HTMLButtonElement>(null);

  // The dialog's overlay blocks clicks but a modal must also move focus into itself, or
  // whatever had focus underneath (typically the terminal input) stays focused and keyboard
  // input keeps reaching an element the player can no longer see. Deliberately deferred rather
  // than focused synchronously on mount: this mount is itself caused by the very keydown that
  // ran 'conclude', and that key's keyup hasn't been dispatched yet -- focusing the button
  // immediately makes that same still-in-flight Enter also activate Restart, instantly
  // restarting the session before the player ever sees the ending.
  useEffect(() => {
    const timer = setTimeout(() => restartButtonRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const ending = ENDINGS.find((e) => e.id === endingId);
  if (!ending) return null;

  const title = pick(ending.title, language);
  const body = paragraphsFrom(pick(ending.body, language));

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
        <button ref={restartButtonRef} className="ending-screen__button" onClick={handleRestart}>
          {t.ending.restartButton}
        </button>
      </motion.div>
    </div>
  );
}
