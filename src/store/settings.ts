export interface SettingsState {
  volume: number;
  muted: boolean;
  reducedMotion: boolean;
}

export const INITIAL_SETTINGS_STATE: SettingsState = {
  volume: 0.6,
  muted: false,
  reducedMotion: false,
};
