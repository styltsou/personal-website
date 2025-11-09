/**
 * Hook for persisting icon positions to localStorage
 * Works with Zustand store
 */

import { useEffect } from 'react';
import { useIconStore, type IconState } from '../stores/icon-store';

interface PersistedIconState {
  [iconId: string]: {
    gridX: number;
    gridY: number;
  };
}

const STORAGE_KEY = 'desktop-icons';

export function useIconPersistence() {
  // Properly select from store with individual selectors
  const iconStates = useIconStore((state) => state.iconStates);
  const initializeFromPersistence = useIconStore(
    (state) => state.initializeFromPersistence
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedIconState = JSON.parse(saved);

        // Convert persisted format to IconState array
        const persistedStates: IconState[] = Object.entries(parsed).map(
          ([iconId, position]) => ({
            id: iconId,
            position: {
              gridX: position.gridX,
              gridY: position.gridY,
            },
          })
        );

        initializeFromPersistence(persistedStates);
      }
    } catch (error) {
      console.warn('Failed to load icon positions from localStorage:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Save to localStorage whenever states change
  useEffect(() => {
    try {
      // Convert IconState array to persisted format
      const stateToSave: PersistedIconState = {};
      iconStates.forEach((iconState) => {
        stateToSave[iconState.id] = {
          gridX: iconState.position.gridX,
          gridY: iconState.position.gridY,
        };
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      // Handle quota exceeded gracefully
      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        console.warn('localStorage quota exceeded for icon positions:', error);
      } else {
        console.warn('Failed to save icon positions to localStorage:', error);
      }
    }
  }, [iconStates]);
}
