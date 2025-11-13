/**
 * Zustand store for window state management
 * Provides a clean, DX-friendly API for managing windows
 */

import { create } from 'zustand';
import { apps, type AppConfig } from '../data/apps';
import {
  calculateCenteredPosition,
  calculateCascadedPosition,
  getMaxZIndex,
  calculateNextZIndex,
  getDefaultWindowSize,
  constrainWindowSize,
  BASE_Z_INDEX,
  type WindowPosition,
  type WindowSize,
} from '../utils/window-utils';

export type SnapSide = 'left' | 'right' | 'top' | null;

export interface WindowState {
  id: string;
  config: AppConfig;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  snapSide: SnapSide;
  content?: string;
}

// Store closed window state (without content and transient state)
export interface ClosedWindowState {
  id: string;
  position: WindowPosition;
  size: WindowSize;
  isMaximized: boolean;
}

interface WindowStore {
  // State
  windowStates: WindowState[];
  closedWindows: Record<string, ClosedWindowState>; // Map of windowId -> closed window state
  activeWindowId: string | null;
  nextZIndex: number;
  hasLoadedFromPersistence: boolean;

  // Actions
  openWindow: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  unfocusWindow: () => void;
  updateWindowPosition: (windowId: string, position: WindowPosition) => void;
  updateWindowSize: (windowId: string, size: WindowSize) => void;
  updateWindowContent: (windowId: string, content: string) => void;
  snapWindow: (windowId: string, snapSide: SnapSide) => void;
  unsnapWindow: (windowId: string) => void;
  closeAllWindows: () => void;
  initializeFromPersistence: (
    persistedStates: WindowState[],
    persistedNextZIndex: number
  ) => void;
  getWindowState: (windowId: string) => WindowState | undefined;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  // Initial state
  windowStates: [],
  closedWindows: {},
  activeWindowId: null,
  nextZIndex: BASE_Z_INDEX,
  hasLoadedFromPersistence: false,

  // Open a window
  openWindow: (windowId: string) => {
    const state = get();
    const config = apps.find((w) => w.id === windowId);
    if (!config) return;

    // Check if window is already open
    const existing = state.windowStates.find((ws) => ws.id === windowId);
    if (existing) {
      // Bring to front and restore if minimized
      // We need to update z-index and active window
      const maxZIndex = getMaxZIndex(state.windowStates);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);
      set({
        windowStates: state.windowStates.map((ws) => {
          if (ws.id !== windowId) return ws;
          // Restore the window: un-minimize and bring to front
          return {
            ...ws,
            zIndex: newZIndex,
            isMinimized: false,
            // Keep snapSide unchanged - if window was snapped, it should remain snapped
          };
        }),
        activeWindowId: windowId,
        nextZIndex: state.nextZIndex + 1,
      });
      return;
    }

    // Check if this window was previously closed and restore its state
    const closedState = state.closedWindows[windowId];
    let newWindowSize: WindowSize;
    let newWindowPosition: WindowPosition;
    let newIsMaximized: boolean;

    if (closedState) {
      // Restore from closed window state
      newWindowSize = closedState.size;
      newWindowPosition = closedState.position;
      newIsMaximized = closedState.isMaximized;
    } else {
      // First time opening - use default size/position
      const defaultSize = getDefaultWindowSize();
      const centeredPosition = calculateCenteredPosition(
        defaultSize.width,
        defaultSize.height
      );

      // Get visible windows (non-minimized) to check for cascading
      const visibleWindows = state.windowStates.filter((ws) => !ws.isMinimized);

      // Calculate cascaded position if needed
      newWindowPosition = calculateCascadedPosition(
        centeredPosition,
        visibleWindows,
        defaultSize.width,
        defaultSize.height
      );
      newWindowSize = defaultSize;
      newIsMaximized = false;
    }

    // Calculate z-index for new window
    const maxZIndex = getMaxZIndex(state.windowStates);
    const newWindowZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

    // Create new window state
    const newWindow: WindowState = {
      id: windowId,
      config,
      position: newWindowPosition,
      size: newWindowSize,
      zIndex: newWindowZIndex,
      isMinimized: false,
      isMaximized: newIsMaximized,
      snapSide: null,
    };

    set({
      windowStates: [...state.windowStates, newWindow],
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: windowId,
    });
  },

  // Close a window - save its state before closing
  closeWindow: (windowId: string) => {
    set((state) => {
      const windowToClose = state.windowStates.find((ws) => ws.id === windowId);
      if (!windowToClose) return state;

      // Save window state before closing
      // Since position/size are now always the actual values (not overridden when maximized),
      // we can just use them directly
      const closedState: ClosedWindowState = {
        id: windowId,
        position: windowToClose.position,
        size: windowToClose.size,
        isMaximized: windowToClose.isMaximized,
      };

      return {
        windowStates: state.windowStates.filter((ws) => ws.id !== windowId),
        closedWindows: {
          ...state.closedWindows,
          [windowId]: closedState,
        },
        activeWindowId:
          state.activeWindowId === windowId ? null : state.activeWindowId,
      };
    });
  },

  // Minimize a window
  minimizeWindow: (windowId: string) => {
    set((state) => ({
      windowStates: state.windowStates.map((ws) =>
        ws.id === windowId ? { ...ws, isMinimized: true } : ws
      ),
    }));
  },

  // Maximize/Restore a window
  maximizeWindow: (windowId: string) => {
    set((state) => {
      const maxZIndex = getMaxZIndex(state.windowStates);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

      return {
        windowStates: state.windowStates.map((ws) => {
          if (ws.id !== windowId) return ws;

          if (ws.isMaximized) {
            // Restore - just set isMaximized to false, position/size are already correct
            // The component will stop overriding display when isMaximized becomes false
            return {
              ...ws,
              isMaximized: false,
              snapSide: null, // Unsnap when restoring from maximized
              zIndex: newZIndex, // Bring to front when restoring
            };
          } else {
            // Maximize - DON'T change position/size, component will override display
            return {
              ...ws,
              isMaximized: true,
              snapSide: null, // Unsnap when maximizing
              // Keep position and size unchanged - component will override display
              zIndex: newZIndex, // Bring to front when maximizing
            };
          }
        }),
        activeWindowId: windowId,
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  // Focus a window (bring to front)
  focusWindow: (windowId: string) => {
    const config = apps.find((w) => w.id === windowId);
    if (!config) return;

    set((state) => {
      const maxZIndex = getMaxZIndex(state.windowStates);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);
      return {
        windowStates: state.windowStates.map((ws) => ({
          ...ws,
          zIndex: ws.id === windowId ? newZIndex : ws.zIndex,
        })),
        activeWindowId: windowId,
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  // Unfocus window (clear active window)
  unfocusWindow: () => {
    set({ activeWindowId: null });
  },

  // Update window position
  updateWindowPosition: (windowId: string, position: WindowPosition) => {
    set((state) => ({
      windowStates: state.windowStates.map((ws) => {
        if (ws.id !== windowId || ws.isMaximized) return ws;
        return {
          ...ws,
          position,
        };
      }),
    }));
  },

  // Update window size
  updateWindowSize: (windowId: string, size: WindowSize) => {
    set((state) => ({
      windowStates: state.windowStates.map((ws) => {
        if (ws.id !== windowId || ws.isMaximized) return ws;
        return {
          ...ws,
          size: constrainWindowSize(size),
        };
      }),
    }));
  },

  // Update window content
  updateWindowContent: (windowId: string, content: string) => {
    set((state) => ({
      windowStates: state.windowStates.map((ws) =>
        ws.id === windowId ? { ...ws, content } : ws
      ),
    }));
  },

  // Snap a window to a side
  snapWindow: (windowId: string, snapSide: SnapSide) => {
    set((state) => {
      const window = state.windowStates.find((ws) => ws.id === windowId);
      if (!window || window.isMaximized || !snapSide) return state;

      // Don't store snapped size/position - derive it during rendering
      // Keep the actual size/position unchanged - snapping is visual only
      const maxZIndex = getMaxZIndex(state.windowStates);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

      return {
        windowStates: state.windowStates.map((ws) => {
          if (ws.id !== windowId) return ws;
          return {
            ...ws,
            snapSide,
            // Keep the actual size/position unchanged - snapping is visual only
            zIndex: newZIndex,
          };
        }),
        activeWindowId: windowId,
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  // Unsnap a window
  unsnapWindow: (windowId: string) => {
    set((state) => {
      const window = state.windowStates.find((ws) => ws.id === windowId);
      if (!window || !window.snapSide) return state;

      // Since we don't store snapped size/position, just clear snapSide
      // The window's actual size/position never changed, so no restoration needed
      const maxZIndex = getMaxZIndex(state.windowStates);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

      return {
        windowStates: state.windowStates.map((ws) => {
          if (ws.id !== windowId) return ws;
          return {
            ...ws,
            snapSide: null,
            zIndex: newZIndex,
          };
        }),
        activeWindowId: windowId,
        nextZIndex: state.nextZIndex + 1,
      };
    });
  },

  // Close all windows
  closeAllWindows: () => {
    set({
      windowStates: [],
      activeWindowId: null,
    });
  },

  // Initialize from persisted state
  initializeFromPersistence: (
    persistedStates: WindowState[],
    persistedNextZIndex: number,
    persistedClosedWindows?: Record<string, ClosedWindowState>
  ) => {
    const { hasLoadedFromPersistence } = get();
    if (!hasLoadedFromPersistence) {
      set({
        windowStates: persistedStates,
        closedWindows: persistedClosedWindows || {},
        nextZIndex: persistedNextZIndex,
        hasLoadedFromPersistence: true,
      });
    }
  },

  // Get window state by ID
  getWindowState: (windowId: string) => {
    return get().windowStates.find((ws) => ws.id === windowId);
  },
}));

// Selectors for better performance and cleaner usage
export const useWindowStates = () =>
  useWindowStore((state) => state.windowStates);
export const useActiveWindowId = () =>
  useWindowStore((state) => state.activeWindowId);
export const useWindowActions = () =>
  useWindowStore((state) => ({
    openWindow: state.openWindow,
    closeWindow: state.closeWindow,
    minimizeWindow: state.minimizeWindow,
    maximizeWindow: state.maximizeWindow,
    focusWindow: state.focusWindow,
    updateWindowPosition: state.updateWindowPosition,
    updateWindowSize: state.updateWindowSize,
    updateWindowContent: state.updateWindowContent,
    snapWindow: state.snapWindow,
    unsnapWindow: state.unsnapWindow,
    closeAllWindows: state.closeAllWindows,
  }));
