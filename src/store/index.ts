/**
 * Combined Zustand store using slices pattern
 * Manages both window and icon state in a single store
 */

import { create } from 'zustand';
import { createWindowSlice } from './window/slice';
import { createIconSlice } from './icon/slice';
import type { WindowSlice } from './window/types';
import type { IconSlice } from './icon/types';

// Combined Store Type
export type Store = WindowSlice & IconSlice;

// Create combined store
export const useStore = create<Store>((set, get) => ({
  ...createWindowSlice(set, get),
  ...createIconSlice(set, get),
}));

// Window Selectors (for backward compatibility)
export const useWindows = () => useStore((state) => state.windows);
export const useActiveWindowId = () => useStore((state) => state.activeWindowId);
export const useWindowActions = () =>
  useStore((state) => ({
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

// Icon Selectors (for backward compatibility)
export const useIconStates = () => useStore((state) => state.iconStates);
export const useSelectedIconId = () => useStore((state) => state.selectedIconId);
export const useIconActions = () =>
  useStore((state) => ({
    updateIconPosition: state.updateIconPosition,
    selectIcon: state.selectIcon,
    deselectIcons: state.deselectIcons,
  }));

