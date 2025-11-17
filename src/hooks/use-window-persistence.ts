/**
 * Hook for persisting window states to sessionStorage
 * Works with Zustand store
 */

import { useEffect } from 'react';
import { useStore } from '../store';
import type { WindowState, ClosedWindowState } from '../types/window';
import { BASE_Z_INDEX } from '../constants';

interface PersistedState {
  windows: WindowState[];
  closedWindows: Record<string, ClosedWindowState>;
  nextZIndex: number;
}

const STORAGE_KEY = 'desktop-windows';

export function useWindowPersistence() {
  // Properly select from store with individual selectors
  const windows = useStore((state) => state.windows);
  const closedWindows = useStore((state) => state.closedWindows);
  const nextZIndex = useStore((state) => state.nextZIndex);
  const initializeFromPersistence = useStore(
    (state) => state.initializeFromPersistence
  );
  const hasLoadedFromPersistence = useStore(
    (state) => state.hasLoadedFromPersistence
  );

  // Load from sessionStorage on mount
  useEffect(() => {
    // If already loaded, don't reload
    if (hasLoadedFromPersistence) return;

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedState = JSON.parse(saved);
        // Support both old 'windowStates' and new 'windows' keys for backward compatibility
        const persistedWindows = parsed.windows || parsed.windowStates || [];
        initializeFromPersistence(
          persistedWindows,
          parsed.nextZIndex || 1000,
          parsed.closedWindows || {}
        );
      }
      // If no saved state, hasLoadedFromPersistence is already true from initial check
    } catch (error) {
      console.warn('Failed to load window states from sessionStorage:', error);
      // Mark as loaded even on error to prevent infinite loading
      initializeFromPersistence([], BASE_Z_INDEX, {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Save to sessionStorage whenever states change
  useEffect(() => {
    try {
      const stateToSave: PersistedState = {
        windows,
        closedWindows,
        nextZIndex,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save window states to sessionStorage:', error);
    }
  }, [windows, closedWindows, nextZIndex]);
}
