/**
 * Icon Slice Types
 */

import type { IconPosition, IconState } from '@/types/icon';

export interface IconSlice {
  // State
  iconStates: IconState[];
  selectedIconId: string | null;
  draggingIconId: string | null;
  draggingIconPosition: { x: number; y: number } | null;
  iconHasLoadedFromPersistence: boolean;

  // Actions
  updateIconPosition: (iconId: string, position: IconPosition) => void;
  selectIcon: (iconId: string) => void;
  deselectIcons: () => void;
  setDraggingIcon: (
    iconId: string | null,
    position?: { x: number; y: number } | null
  ) => void;
  initializeIconFromPersistence: (persistedStates: IconState[]) => void;
  getIconState: (iconId: string) => IconState | undefined;
}
