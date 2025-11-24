/**
 * Combined Zustand store using slices pattern
 */

import { create } from 'zustand';

import type { WindowSlice } from './window/types';
import type { IconSlice } from './icon/types';
import type { SettingsSlice } from './settings/types';

import { createWindowSlice } from './window/slice';
import { createIconSlice } from './icon/slice';
import { createSettingsSlice } from './settings/slice';

export type Store = WindowSlice & IconSlice & SettingsSlice;

export const useStore = create<Store>((...args) => ({
  ...createWindowSlice(...args),
  ...createIconSlice(...args),
  ...createSettingsSlice(...args),
}));

// TODO: Need to remove this backward compatibility bloat
export const useWindows = () => useStore(state => state.windows);
export const useActiveWindowId = () => useStore(state => state.activeWindowId);
export const useWindowActions = () =>
  useStore(state => ({
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
export const useIconStates = () => useStore(state => state.iconStates);
export const useSelectedIconId = () => useStore(state => state.selectedIconId);
export const useIconActions = () =>
  useStore(state => ({
    updateIconPosition: state.updateIconPosition,
    selectIcon: state.selectIcon,
    deselectIcons: state.deselectIcons,
  }));
