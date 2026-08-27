import { SLICE_EVENTS } from "@content/events/slice-events";
import { MILESTONE1_EVENTS } from "@content/events/milestone1-events";
import { MILESTONE2_EVENTS } from "@content/events/milestone2-events";
import { MILESTONE3_EVENTS } from "@content/events/milestone3-events";
import type { GameEvent } from "@/core/events/types";

export const ALL_EVENTS: GameEvent[] = [
  ...SLICE_EVENTS,
  ...MILESTONE1_EVENTS,
  ...MILESTONE2_EVENTS,
  ...MILESTONE3_EVENTS,
];
