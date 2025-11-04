/**
 * Zustand store for icon state management
 * Manages icon positions, selection state, and provides actions
 */

import { create } from 'zustand';

export interface IconPosition {
  gridX: number;
  gridY: number;
}

export interface IconState {
  id: string;
  position: IconPosition;
}

interface IconStore {
  // State
  iconStates: IconState[];
  selectedIconId: string | null;
  draggingIconId: string | null; // Track which icon is currently being dragged
  draggingIconPosition: { x: number; y: number } | null; // Position of dragging icon
  hasLoadedFromPersistence: boolean;

  // Actions
  updateIconPosition: (iconId: string, position: IconPosition) => void;
  selectIcon: (iconId: string) => void;
  deselectIcons: () => void;
  setDraggingIcon: (iconId: string | null, position?: { x: number; y: number } | null) => void;
  initializeFromPersistence: (
    persistedStates: IconState[]
  ) => void;
  getIconState: (iconId: string) => IconState | undefined;
}

export const useIconStore = create<IconStore>((set, get) => ({
  // Initial state
  iconStates: [],
  selectedIconId: null,
  draggingIconId: null,
  draggingIconPosition: null,
  hasLoadedFromPersistence: false,

  // Update icon position
  updateIconPosition: (iconId: string, position: IconPosition) => {
    set((state) => {
      const existing = state.iconStates.find((is) => is.id === iconId);
      if (existing) {
        // Update existing icon position
        return {
          iconStates: state.iconStates.map((is) =>
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
  setDraggingIcon: (iconId: string | null, position?: { x: number; y: number } | null) => {
    set({
      draggingIconId: iconId,
      draggingIconPosition: position ?? null,
    });
  },

  // Initialize from persisted state
  initializeFromPersistence: (persistedStates: IconState[]) => {
    const { hasLoadedFromPersistence } = get();
    if (!hasLoadedFromPersistence) {
      set({
        iconStates: persistedStates,
        hasLoadedFromPersistence: true,
      });
    }
  },

  // Get icon state by ID
  getIconState: (iconId: string) => {
    return get().iconStates.find((is) => is.id === iconId);
  },
}));

// Selectors for better performance and cleaner usage
export const useIconStates = () =>
  useIconStore((state) => state.iconStates);
export const useSelectedIconId = () =>
  useIconStore((state) => state.selectedIconId);
export const useIconActions = () =>
  useIconStore((state) => ({
    updateIconPosition: state.updateIconPosition,
    selectIcon: state.selectIcon,
    deselectIcons: state.deselectIcons,
  }));

