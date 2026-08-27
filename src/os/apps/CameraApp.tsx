import { useState } from "react";
import { useGameStore } from "@/store";
import { evaluateConditions } from "@/core/conditions";
import { CAMERA_FEEDS } from "@content/cameras/feeds";
import { TIME_COSTS } from "@/core/time";
import "./CameraApp.css";

export default function CameraApp() {
  const flags = useGameStore((s) => s.story.flags);
  const power = useGameStore((s) => s.power.systems);
  const minutesElapsed = useGameStore((s) => s.time.minutesElapsed);
  const advanceTime = useGameStore((s) => s.advanceTime);
  const setFlag = useGameStore((s) => s.setFlag);

  const [selectedId, setSelectedId] = useState(CAMERA_FEEDS[0]?.id ?? "");
  const world = { flags, power, minutesElapsed };
  const selectedFeed = CAMERA_FEEDS.find((f) => f.id === selectedId);
  const feedOnline = selectedFeed ? evaluateConditions(selectedFeed.requires, world) : false;

  function selectFeed(id: string) {
    setSelectedId(id);
    const feed = CAMERA_FEEDS.find((f) => f.id === id);
    if (!feed || !evaluateConditions(feed.requires, world)) return;
    advanceTime(TIME_COSTS.openCamera);
    if (feed.id === "sector-c") setFlag("viewedSectorCCamera", true);
  }

  return (
    <div className="camera-app">
      <div className="camera-app__list">
        {CAMERA_FEEDS.map((feed) => (
          <button
            key={feed.id}
            className={`camera-app__feed-button${feed.id === selectedId ? " camera-app__feed-button--active" : ""}`}
            onClick={() => selectFeed(feed.id)}
          >
            {feed.name}
          </button>
        ))}
      </div>
      <div className="camera-app__viewport">
        {!selectedFeed && <p>No feed selected.</p>}
        {selectedFeed && !feedOnline && <p className="camera-app__denied">ACCESS DENIED -- camera grid offline.</p>}
        {selectedFeed &&
          feedOnline &&
          selectedFeed.body.map((line, i) => <p key={i}>{line}</p>)}
      </div>
    </div>
  );
}
