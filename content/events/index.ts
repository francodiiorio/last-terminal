import { SLICE_EVENTS } from "@content/events/slice-events";
import { MILESTONE1_EVENTS } from "@content/events/milestone1-events";
import type { GameEvent } from "@/core/events/types";

export const ALL_EVENTS: GameEvent[] = [...SLICE_EVENTS, ...MILESTONE1_EVENTS];
