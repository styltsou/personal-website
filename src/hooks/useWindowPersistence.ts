/**
 * Hook for persisting window states to sessionStorage
 * Works with Zustand store
 */

import { useEffect } from 'react';
import { useWindowStore, type WindowState } from '../stores/windowStore';

interface PersistedState {
  windowStates: WindowState[];
  nextZIndex: number;
}

const STORAGE_KEY = 'desktop-windows';

export function useWindowPersistence() {
  // Properly select from store with individual selectors
  const windowStates = useWindowStore((state) => state.windowStates);
  const nextZIndex = useWindowStore((state) => state.nextZIndex);
  const initializeFromPersistence = useWindowStore(
    (state) => state.initializeFromPersistence
  );

  // Load from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedState = JSON.parse(saved);
        initializeFromPersistence(
          parsed.windowStates || [],
          parsed.nextZIndex || 1000
        );
      }
    } catch (error) {
      console.warn('Failed to load window states from sessionStorage:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Save to sessionStorage whenever states change
  useEffect(() => {
    try {
      const stateToSave: PersistedState = {
        windowStates,
        nextZIndex,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save window states to sessionStorage:', error);
    }
  }, [windowStates, nextZIndex]);
}
