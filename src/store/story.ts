import type { StoryFlags } from "@/core/flags";

export interface StoryState {
  flags: StoryFlags;
  firedOnceIds: string[];
  /** null until one of the mutually-exclusive ending events fires (see content/events/milestone3-events.ts) */
  endingId: string | null;
}

export const INITIAL_STORY_STATE: StoryState = {
  flags: {},
  firedOnceIds: [],
  endingId: null,
};
