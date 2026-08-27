import { DEFAULT_LANGUAGE, type Language } from "@/core/language";

export interface SettingsState {
  volume: number;
  muted: boolean;
  reducedMotion: boolean;
  language: Language;
}

export const INITIAL_SETTINGS_STATE: SettingsState = {
  volume: 0.6,
  muted: false,
  reducedMotion: false,
  language: DEFAULT_LANGUAGE,
};
