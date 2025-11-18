/**
 * Icon Slice Implementation
 */

import type { StateCreator } from 'zustand';
import type { IconPosition, IconState } from '@/types/icon';
import type { IconSlice } from './types';
import type { Store } from '../index';

export const createIconSlice: StateCreator<Store, [], [], IconSlice> = (
  set,
  get
) => ({
  // Initial state
  iconStates: [],
  selectedIconId: null,
  draggingIconId: null,
  draggingIconPosition: null,
  iconHasLoadedFromPersistence: false,

  // Update icon position
  updateIconPosition: (iconId: string, position: IconPosition) => {
    set(state => {
      const existing = state.iconStates.find(is => is.id === iconId);
      if (existing) {
        // Update existing icon position
        return {
          iconStates: state.iconStates.map(is =>
            is.id === iconId ? { ...is, position } : is
          ),
        };
      } else {
        // Add new icon state
        return {
          iconStates: [...state.iconStates, { id: iconId, position }],
        };
      }
    });
  },

  // Select an icon
  selectIcon: (iconId: string) => {
    set({
      selectedIconId: iconId,
    });
  },

  // Deselect all icons
  deselectIcons: () => {
    set({
      selectedIconId: null,
    });
  },

  // Set which icon is being dragged and its position
  setDraggingIcon: (
    iconId: string | null,
    position?: { x: number; y: number } | null
  ) => {
    set({
      draggingIconId: iconId,
      draggingIconPosition: position ?? null,
    });
  },

  // Initialize from persisted state
  initializeIconFromPersistence: (persistedStates: IconState[]) => {
    const { iconHasLoadedFromPersistence } = get();
    if (!iconHasLoadedFromPersistence) {
      set({
        iconStates: persistedStates,
        iconHasLoadedFromPersistence: true,
      });
    }
  },

  // Get icon state by ID
  getIconState: (iconId: string) => {
    return get().iconStates.find(is => is.id === iconId);
  },
});
