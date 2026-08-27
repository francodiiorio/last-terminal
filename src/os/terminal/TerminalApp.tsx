import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useGameStore } from "@/store";
import { audioManager } from "@/audio/manager";
import { useStrings } from "@/i18n/useStrings";
import "./TerminalApp.css";

export default function TerminalApp() {
  const t = useStrings();
  const output = useGameStore((s) => s.terminal.output);
  const history = useGameStore((s) => s.terminal.history);
  const cwd = useGameStore((s) => s.filesystem.cwd);
  const runCommand = useGameStore((s) => s.runCommand);

  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [output]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit() {
    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    runCommand(trimmed);
    setInput("");
    setHistoryIndex(null);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    audioManager.play("terminalKey");
    if (e.key === "Enter") {
      submit();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex] ?? "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex] ?? "");
      }
    }
  }

  function handleTerminalClick() {
    // Don't steal focus back to the input if this click is the tail end of the user
    // dragging to select output text (e.g. to copy a log line) -- refocusing collapses
    // whatever they just selected before they can copy it.
    if ((window.getSelection()?.toString().length ?? 0) > 0) return;
    inputRef.current?.focus();
  }

  return (
    <div className="terminal" onClick={handleTerminalClick}>
      <div className="terminal__output" ref={outputRef} role="log" aria-live="polite">
        {output.map((line) => (
          <p key={line.id} className={`terminal__line terminal__line--${line.kind}`}>
            {line.text}
          </p>
        ))}
      </div>
      <div className="terminal__input-row">
        <span className="terminal__prompt">{cwd} $</span>
        <input
          ref={inputRef}
          className="terminal__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          aria-label={t.terminal.inputAriaLabel}
        />
      </div>
    </div>
  );
}
