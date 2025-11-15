/**
 * Window Slice Implementation
 */

import { apps } from '@/app-config';
import { BASE_Z_INDEX } from '@/constants';
import {
  calculateCenteredPosition,
  calculateCascadedPosition,
  getMaxZIndex,
  calculateNextZIndex,
  getDefaultWindowSize,
  constrainWindowSize,
} from '@/components/window/utils/window-utils';
import type { WindowState, ClosedWindowState, WindowPosition, WindowSize, SnapSide } from '@/types/window';
import type { WindowSlice } from './types';
import type { Store } from '../index';

// Check if we should initialize from persistence synchronously (only on client)
let initialHasLoadedFromPersistence = false;
if (typeof window !== 'undefined') {
  try {
    const saved = sessionStorage.getItem('desktop-windows');
    if (saved) {
      // If there's saved state, we'll load it async, so start as false
      initialHasLoadedFromPersistence = false;
    } else {
      // No saved state, mark as loaded immediately
      initialHasLoadedFromPersistence = true;
    }
  } catch {
    // On error, mark as loaded to prevent infinite loading
    initialHasLoadedFromPersistence = true;
  }
}

export const createWindowSlice = (set: any, get: () => Store): WindowSlice => ({
  // Initial state
  windowStates: [],
  closedWindows: {},
  activeWindowId: null,
  nextZIndex: BASE_Z_INDEX,
  hasLoadedFromPersistence: initialHasLoadedFromPersistence,

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
      // Restore full config from apps array (component references are lost during JSON serialization)
      const restoredStates = persistedStates.map((persistedState) => {
        const appConfig = apps.find((app) => app.id === persistedState.id);
        if (appConfig) {
          return {
            ...persistedState,
            config: appConfig, // Restore full config with component reference
          };
        }
        return persistedState; // Fallback if app not found
      });

      set({
        windowStates: restoredStates,
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
});

