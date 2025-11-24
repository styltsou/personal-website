/**
 * Settings Slice Types
 */

import type { Settings, Theme } from '@/utils/settings';

export interface SettingsSlice {
  // State
  settings: Settings;

  // Actions
  updateTheme: (theme: Theme) => void;
  updateAccentColor: (colorId: string) => void;
  updateBackgroundPattern: (patternId: string) => void;
  initializeSettings: (settings: Settings) => void;
}

