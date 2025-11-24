/**
 * Settings Slice Implementation
 */

import type { StateCreator } from 'zustand';
import type { SettingsSlice } from './types';
import type { Store } from '../index';
import { getSettings, type Settings, type Theme } from '@/utils/settings';

// Initialize settings from localStorage synchronously (only on client)
let initialSettings: Settings;
if (typeof window !== 'undefined') {
  initialSettings = getSettings();
} else {
  // SSR fallback
  initialSettings = {
    theme: 'light',
    accentColorId: 'peach',
    backgroundPattern: 'grid',
  };
}

export const createSettingsSlice: StateCreator<
  Store,
  [],
  [],
  SettingsSlice
> = (set, get) => ({
  // Initial state
  settings: initialSettings,

  // Update theme
  updateTheme: (theme: Theme) => {
    set(state => {
      // When theme changes, we need to reapply the accent color for the new theme
      // The accent color ID stays the same, but the actual color value changes
      return {
        settings: {
          ...state.settings,
          theme,
        },
      };
    });
  },

  // Update accent color
  updateAccentColor: (colorId: string) => {
    set(state => ({
      settings: {
        ...state.settings,
        accentColorId: colorId,
      },
    }));
  },

  // Update background pattern
  updateBackgroundPattern: (patternId: string) => {
    set(state => ({
      settings: {
        ...state.settings,
        backgroundPattern: patternId,
      },
    }));
  },

  // Initialize settings (for persistence restoration)
  initializeSettings: (settings: Settings) => {
    set({
      settings,
    });
  },
});

