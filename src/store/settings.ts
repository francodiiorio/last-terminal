export interface SettingsState {
  volume: number;
  reducedMotion: boolean;
}

export const INITIAL_SETTINGS_STATE: SettingsState = {
  volume: 0.6,
  reducedMotion: false,
};
