/**
 * Window Slice Implementation
 */

import { apps, getAppForFile } from '@/app-config';
import { BASE_Z_INDEX } from '@/constants';
import {
  calculateCenteredPosition,
  calculateCascadedPosition,
  getMaxZIndex,
  calculateNextZIndex,
  getDefaultWindowSize,
  constrainWindowSize,
} from '@/components/window/utils/window-utils';
import type {
  WindowState,
  ClosedWindowState,
  WindowPosition,
  WindowSize,
  SnapSide,
} from '@/types/window';
import type { WindowSlice } from './types';
import type { Store } from '../index';
import type { StateCreator } from 'zustand';

// TODO: The following lines of code up until the store creation look weird na bloated, i need to check on them

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

// Helper function to open a window with a given config
// This is used by both openWindow and openFile to avoid code duplication
const openWindowWithConfig = (
  windowId: string,
  config: NonNullable<ReturnType<typeof apps.find>>,
  set: Parameters<StateCreator<Store, [], [], WindowSlice>>[0],
  get: Parameters<StateCreator<Store, [], [], WindowSlice>>[1],
  configOverrides?: {
    title?: string;
    props?: Record<string, unknown>;
  }
) => {
  const state = get();

  // Merge config with any overrides
  const mergedConfig = {
    ...config,
    ...(configOverrides?.title && { title: configOverrides.title }),
    ...(configOverrides?.props && {
      props: {
        ...config.props,
        ...configOverrides.props,
      },
    }),
  };

  // Check if window is already open
  const existing = state.windows.find(window => window.id === windowId);
  if (existing) {
    // Bring to front and restore if minimized
    const maxZIndex = getMaxZIndex(state.windows);
    const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);
    set({
      windows: state.windows.map(window => {
        if (window.id !== windowId) return window;
        // Restore the window: un-minimize and bring to front
        return {
          ...window,
          config: mergedConfig, // Update config in case it changed
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
    // First time opening - use initialSize from config or default size
    const initialSize = mergedConfig.initialSize ?? getDefaultWindowSize();
    const centeredPosition = calculateCenteredPosition(
      initialSize.width,
      initialSize.height
    );

    // Get visible windows (non-minimized) to check for cascading
    const visibleWindows = state.windows.filter(window => !window.isMinimized);

    // Calculate cascaded position if needed
    newWindowPosition = calculateCascadedPosition(
      centeredPosition,
      visibleWindows,
      initialSize.width,
      initialSize.height
    );
    newWindowSize = initialSize;
    newIsMaximized = false;
  }

  // Calculate z-index for new window
  const maxZIndex = getMaxZIndex(state.windows);
  const newWindowZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

  // Create new window state
  const newWindow: WindowState = {
    id: windowId,
    config: mergedConfig,
    position: newWindowPosition,
    size: newWindowSize,
    zIndex: newWindowZIndex,
    isMinimized: false,
    isMaximized: newIsMaximized,
    snapSide: null,
    isPinned: mergedConfig.pinned === true, // Initialize from config (defaults to false), can be changed dynamically later
  };

  set({
    windows: [...state.windows, newWindow],
    nextZIndex: state.nextZIndex + 1,
    activeWindowId: windowId,
  });
};

export const createWindowSlice: StateCreator<Store, [], [], WindowSlice> = (
  set,
  get
) => ({
  windows: [],
  closedWindows: {},
  activeWindowId: null,
  nextZIndex: BASE_Z_INDEX,
  hasLoadedFromPersistence: initialHasLoadedFromPersistence,

  openWindow: (windowId: string) => {
    const config = apps.find(w => w.id === windowId && w.type === 'app');
    if (!config) return;

    openWindowWithConfig(windowId, config, set, get);
  },

  // Open a file in its associated app
  openFile: (filePath: string) => {
    const appId = getAppForFile(filePath);

    if (!appId) {
      console.warn(`No app associated with file: ${filePath}`);
      return;
    }

    const config = apps.find(w => w.id === appId && w.type === 'app');
    if (!config || !config.component) {
      console.warn(`App ${appId} not found or doesn't support opening files`);
      return;
    }

    // Generate a unique window ID for this file
    // Use a combination of app ID and file path hash to allow multiple instances
    const windowId = `${appId}-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`;

    // Extract filename for window title
    const fileName = filePath.split('/').pop() || filePath;

    // For photos and pdf-viewer apps, show "App / filename", for others show "filename / appname"
    const title =
      config.id === 'photos' || config.id === 'pdf-viewer'
        ? `${config.title} / ${fileName.toLowerCase()}`
        : `${fileName.toLowerCase()} / ${config.title}`;

    openWindowWithConfig(windowId, config, set, get, {
      title,
      props: {
        filePath, // Pass the file path to the app
      },
    });
  },

  // Close a window - save its state before closing
  // TODO: Something tells me that this closedWindowState is dogshit state architecture
  closeWindow: (windowId: string) => {
    set(state => {
      const windowToClose = state.windows.find(
        window => window.id === windowId
      );
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
        windows: state.windows.filter(
          (window: WindowState) => window.id !== windowId
        ),
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
    set((state: Store) => ({
      windows: state.windows.map((window: WindowState) =>
        window.id === windowId ? { ...window, isMinimized: true } : window
      ),
    }));
  },

  // Maximize/Restore a window
  // TODO: Maybe rename this to maximizeOrRestoreWindow
  maximizeWindow: (windowId: string) => {
    set((state: Store) => {
      const maxZIndex = getMaxZIndex(state.windows);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

      return {
        windows: state.windows.map((window: WindowState) => {
          if (window.id !== windowId) return window;

          if (window.isMaximized) {
            // Restore - just set isMaximized to false, position/size are already correct
            // The component will stop overriding display when isMaximized becomes false
            return {
              ...window,
              isMaximized: false,
              snapSide: null, // Unsnap when restoring from maximized
              zIndex: newZIndex, // Bring to front when restoring
            };
          } else {
            // Maximize - DON'T change position/size, component will override display
            return {
              ...window,
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
    set((state: Store) => {
      // Check if window exists (app window or file window)
      const windowExists = state.windows.some(w => w.id === windowId);
      if (!windowExists) return state;

      const maxZIndex = getMaxZIndex(state.windows);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);
      return {
        windows: state.windows.map((window: WindowState) => {
          if (window.id !== windowId) return window;
          // Restore if minimized and bring to front
          return {
            ...window,
            zIndex: newZIndex,
            isMinimized: false,
          };
        }),
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
    set((state: Store) => ({
      windows: state.windows.map((window: WindowState) => {
        if (window.id !== windowId || window.isMaximized) return window;
        return {
          ...window,
          position,
        };
      }),
    }));
  },

  // Update window size
  updateWindowSize: (windowId: string, size: WindowSize) => {
    set((state: Store) => ({
      windows: state.windows.map((window: WindowState) => {
        if (window.id !== windowId || window.isMaximized) return window;
        return {
          ...window,
          size: constrainWindowSize(size),
        };
      }),
    }));
  },

  // Update window content
  updateWindowContent: (windowId: string, content: string) => {
    set((state: Store) => ({
      windows: state.windows.map((window: WindowState) =>
        window.id === windowId ? { ...window, content } : window
      ),
    }));
  },

  // Snap a window to a side
  snapWindow: (windowId: string, snapSide: SnapSide) => {
    set((state: Store) => {
      const targetWindow = state.windows.find(
        (window: WindowState) => window.id === windowId
      );
      if (!targetWindow || targetWindow.isMaximized || !snapSide) return state;

      // Don't store snapped size/position - derive it during rendering
      // Keep the actual size/position unchanged - snapping is visual only
      const maxZIndex = getMaxZIndex(state.windows);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

      return {
        windows: state.windows.map((window: WindowState) => {
          if (window.id !== windowId) return window;
          return {
            ...window,
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
    set((state: Store) => {
      const targetWindow = state.windows.find(
        (window: WindowState) => window.id === windowId
      );
      if (!targetWindow || !targetWindow.snapSide) return state;

      // Since we don't store snapped size/position, just clear snapSide
      // The window's actual size/position never changed, so no restoration needed
      const maxZIndex = getMaxZIndex(state.windows);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

      return {
        windows: state.windows.map((window: WindowState) => {
          if (window.id !== windowId) return window;
          return {
            ...window,
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
      windows: [],
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
      const restoredStates = persistedStates.map(persistedState => {
        // First, try to find a direct app match (for regular app windows)
        const appConfig = apps.find(
          app => app.type === 'app' && app.id === persistedState.id
        );
        if (appConfig) {
          return {
            ...persistedState,
            config: appConfig, // Restore full config with component reference
            // Ensure isPinned exists (for backward compatibility with old persisted states)
            isPinned: persistedState.isPinned ?? appConfig.pinned === true,
          };
        }

        // If no direct match, check if this is a file window (ID pattern: appId-filepath)
        const fileWindowMatch = persistedState.id.match(/^([^-]+)-/);
        if (fileWindowMatch) {
          const baseAppId = fileWindowMatch[1];
          const baseAppConfig = apps.find(
            app => app.type === 'app' && app.id === baseAppId
          );
          if (baseAppConfig) {
            // Merge persisted config (title, props) with base app config (component, etc.)
            return {
              ...persistedState,
              config: {
                ...baseAppConfig,
                // Preserve the persisted title (which includes filename)
                title: persistedState.config.title ?? baseAppConfig.title,
                // Merge props: base app props first, then persisted props (filePath) override
                props: {
                  ...baseAppConfig.props,
                  ...persistedState.config.props,
                },
              },
              // Ensure isPinned exists
              isPinned:
                persistedState.isPinned ?? baseAppConfig.pinned === true,
            };
          }
        }

        // Fallback if app not found
        return {
          ...persistedState,
          // Ensure isPinned exists even if app not found
          isPinned: persistedState.isPinned ?? false,
        };
      });

      set({
        windows: restoredStates,
        closedWindows: persistedClosedWindows || {},
        nextZIndex: persistedNextZIndex,
        hasLoadedFromPersistence: true,
      });
    }
  },

  // Get window state by ID
  getWindowState: (windowId: string) => {
    return get().windows.find(window => window.id === windowId);
  },
});
