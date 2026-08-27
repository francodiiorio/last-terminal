import { useState } from "react";
import { useGameStore } from "@/store";
import { evaluateConditions } from "@/core/conditions";
import { pick } from "@/core/language";
import { MESSAGES } from "@content/emails/messages";
import { OUTBOUND_DRAFTS } from "@content/emails/drafts";
import { TIME_COSTS } from "@/core/time";
import { audioManager } from "@/audio/manager";
import { useStrings } from "@/i18n/useStrings";
import "./CommsApp.css";

export default function CommsApp() {
  const t = useStrings();
  const language = useGameStore((s) => s.settings.language);
  const flags = useGameStore((s) => s.story.flags);
  const power = useGameStore((s) => s.power.systems);
  const minutesElapsed = useGameStore((s) => s.time.minutesElapsed);
  const markFileRead = useGameStore((s) => s.markFileRead);
  const setFlag = useGameStore((s) => s.setFlag);
  const advanceTime = useGameStore((s) => s.advanceTime);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastSentId, setLastSentId] = useState<string | null>(null);

  const world = { flags, power, minutesElapsed };
  const visibleMessages = MESSAGES.filter((m) => evaluateConditions(m.requires, world));
  const selected = visibleMessages.find((m) => m.id === selectedId) ?? null;

  function selectMessage(id: string) {
    setSelectedId(id);
    markFileRead(id);
  }

  function sendDraft(draftId: string) {
    const draft = OUTBOUND_DRAFTS.find((d) => d.id === draftId);
    if (!draft) return;
    audioManager.play("transmission");
    advanceTime(TIME_COSTS.sendMessage);
    setFlag(draft.confirmFlag, true);
    setLastSentId(draftId);
  }

  const lastSentDraft = OUTBOUND_DRAFTS.find((d) => d.id === lastSentId);

  return (
    <div className="comms-app">
      <div className="comms-app__inbox">
        <div className="comms-app__list">
          {visibleMessages.length === 0 && <p className="comms-app__empty">{t.comms.noMessages}</p>}
          {visibleMessages.map((m) => (
            <button
              key={m.id}
              className={`comms-app__message-button${m.id === selectedId ? " comms-app__message-button--active" : ""}`}
              onClick={() => selectMessage(m.id)}
            >
              <span className="comms-app__message-from">{pick(m.from, language)}</span>
              <span className="comms-app__message-meta">
                {flags[`read:${m.id}`] === true ? t.comms.read : t.comms.new} -- {m.timestamp}
              </span>
            </button>
          ))}
        </div>
        <div className="comms-app__reader">
          {!selected && <p className="comms-app__empty">{t.comms.selectMessage}</p>}
          {selected && (
            <>
              <p>
                <strong>{pick(selected.subject, language)}</strong>
              </p>
              {pick(selected.body, language).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="comms-app__drafts">
        {OUTBOUND_DRAFTS.map((draft) => {
          const sent = flags[draft.confirmFlag] === true;
          const available = evaluateConditions(draft.requires, world);
          return (
            <div className="comms-app__draft-row" key={draft.id}>
              <span>{pick(draft.label, language)}</span>
              <button
                className="comms-app__draft-button"
                onClick={() => sendDraft(draft.id)}
                disabled={sent || !available}
              >
                {sent ? t.comms.sent : available ? t.comms.send : t.comms.offline}
              </button>
            </div>
          );
        })}
        {lastSentDraft && <p className="comms-app__confirmation">{pick(lastSentDraft.confirmation, language).join(" ")}</p>}
      </div>
    </div>
  );
}
