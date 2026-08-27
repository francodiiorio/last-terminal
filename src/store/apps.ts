export interface WindowPosition {
  x: number;
  y: number;
}

export interface AppsState {
  unlockedIds: string[];
  openIds: string[];
  focusedId: string | null;
  positions: Record<string, WindowPosition>;
}

/** Apps available from the start of the vertical slice. */
export const DEFAULT_UNLOCKED_APPS = ["terminal", "power", "cameras"];

export const INITIAL_APPS_STATE: AppsState = {
  unlockedIds: [...DEFAULT_UNLOCKED_APPS],
  openIds: [],
  focusedId: null,
  positions: {},
};
