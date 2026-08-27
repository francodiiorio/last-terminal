import type { StoryFlags } from "@/core/flags";

export interface StoryState {
  flags: StoryFlags;
  firedOnceIds: string[];
}

export const INITIAL_STORY_STATE: StoryState = {
  flags: {},
  firedOnceIds: [],
};
