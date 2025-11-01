/**
 * Zustand store for window state management
 * Provides a clean, DX-friendly API for managing windows
 */

import { create } from 'zustand';
import { windows, type WindowConfig } from '../data/windows';
import {
  calculateCenteredPosition,
  getMaxZIndex,
  calculateNextZIndex,
  getDefaultWindowSize,
  getMaximizedWindowSize,
  getMaximizedWindowPosition,
  BASE_Z_INDEX,
  type WindowPosition,
  type WindowSize,
} from '../utils/windowUtils';

export interface WindowState {
  id: string;
  config: WindowConfig;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  originalSize?: WindowSize;
  originalPosition?: WindowPosition;
  content?: string;
}

interface WindowStore {
  // State
  windowStates: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  hasLoadedFromPersistence: boolean;

  // Actions
  openWindow: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: WindowPosition) => void;
  updateWindowContent: (windowId: string, content: string) => void;
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
  activeWindowId: null,
  nextZIndex: BASE_Z_INDEX,
  hasLoadedFromPersistence: false,

  // Open a window
  openWindow: (windowId: string) => {
    const state = get();
    const config = windows.find((w) => w.id === windowId);
    if (!config) return;

    // Check if window is already open
    const existing = state.windowStates.find((ws) => ws.id === windowId);
    if (existing) {
      // Bring to front and restore if minimized
      // We need to update z-index and active window
      const maxZIndex = getMaxZIndex(state.windowStates);
      const newZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);
      set({
        windowStates: state.windowStates.map((ws) => ({
          ...ws,
          zIndex: ws.id === windowId ? newZIndex : ws.zIndex,
          isMinimized: ws.id === windowId ? false : ws.isMinimized,
        })),
        activeWindowId: windowId,
        nextZIndex: state.nextZIndex + 1,
      });
      return;
    }

    // Calculate position and size for new window
    const defaultSize = getDefaultWindowSize();
    const centeredPosition = calculateCenteredPosition(
      defaultSize.width,
      defaultSize.height
    );

    // Calculate z-index for new window
    const maxZIndex = getMaxZIndex(state.windowStates);
    const newWindowZIndex = calculateNextZIndex(maxZIndex, state.nextZIndex);

    // Create new window state
    const newWindow: WindowState = {
      id: windowId,
      config,
      position: centeredPosition,
      size: defaultSize,
      zIndex: newWindowZIndex,
      isMinimized: false,
      isMaximized: false,
      originalSize: defaultSize,
      originalPosition: centeredPosition,
    };

    set({
      windowStates: [...state.windowStates, newWindow],
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: windowId,
    });
  },

  // Close a window
  closeWindow: (windowId: string) => {
    set((state) => ({
      windowStates: state.windowStates.filter((ws) => ws.id !== windowId),
      activeWindowId:
        state.activeWindowId === windowId ? null : state.activeWindowId,
    }));
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
            // Restore
            return {
              ...ws,
              isMaximized: false,
              size: ws.originalSize || ws.size,
              position: ws.originalPosition || ws.position,
              zIndex: newZIndex, // Bring to front when restoring
            };
          } else {
            // Maximize - save current state
            const maximizedSize = getMaximizedWindowSize();
            const maximizedPosition = getMaximizedWindowPosition();
            return {
              ...ws,
              isMaximized: true,
              originalSize: ws.size,
              originalPosition: ws.position,
              position: maximizedPosition,
              size: maximizedSize,
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
    const config = windows.find((w) => w.id === windowId);
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

  // Update window position
  updateWindowPosition: (windowId: string, position: WindowPosition) => {
    set((state) => ({
      windowStates: state.windowStates.map((ws) =>
        ws.id === windowId && !ws.isMaximized
          ? {
              ...ws,
              position,
              originalPosition: ws.originalPosition || position,
            }
          : ws
      ),
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
    persistedNextZIndex: number
  ) => {
    const { hasLoadedFromPersistence } = get();
    if (!hasLoadedFromPersistence) {
      set({
        windowStates: persistedStates,
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
export const useWindowStates = () => useWindowStore((state) => state.windowStates);
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
    updateWindowContent: state.updateWindowContent,
    closeAllWindows: state.closeAllWindows,
  }));

