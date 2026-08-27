import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import "./DemoEndScreen.css";

export default function DemoEndScreen() {
  const newGame = useGameStore((s) => s.newGame);
  const bootComplete = useGameStore((s) => s.bootComplete);

  function handleRestart() {
    newGame();
    bootComplete();
  }

  return (
    <div className="demo-end">
      <motion.div
        className="demo-end__panel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="demo-end__title">END OF DEMONSTRATION SEGMENT</h1>
        <div className="demo-end__body">
          <p>
            The transmission doesn't match anything CASSIUS logged as outbound. It doesn't match the
            Chorus Signal's usual shape either. Whatever reached AION-7 just now, it isn't finished
            arriving.
          </p>
          <p>
            This is where the current vertical slice ends. The station, the record, and the question
            of who -- or what -- is still listening all continue past this point in a future build.
          </p>
        </div>
        <button className="demo-end__button" onClick={handleRestart}>
          Restart Session
        </button>
      </motion.div>
    </div>
  );
}
