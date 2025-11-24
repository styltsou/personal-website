/**
 * Settings Persistence Hook
 * Saves settings to localStorage and applies them to the document
 */

import { useEffect } from 'react';
import { useStore } from '@/store';
import { saveSettings, applySettings } from '@/utils/settings';

export function useSettingsPersistence() {
  const settings = useStore(state => state.settings);

  // Apply settings to document and save to localStorage whenever they change
  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);
}

