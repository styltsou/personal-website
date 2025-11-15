/**
 * Window Slice Types
 */

import type {
  WindowState,
  ClosedWindowState,
  WindowPosition,
  WindowSize,
  SnapSide,
} from '../../types/window';

export interface WindowSlice {
  // State
  windowStates: WindowState[];
  closedWindows: Record<string, ClosedWindowState>;
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
    persistedNextZIndex: number,
    persistedClosedWindows?: Record<string, ClosedWindowState>
  ) => void;
  getWindowState: (windowId: string) => WindowState | undefined;
}

