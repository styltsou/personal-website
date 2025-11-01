/**
 * Window utility functions
 * Helper functions for window calculations and positioning
 */

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

const DEFAULT_WINDOW_WIDTH = 900;
const DEFAULT_WINDOW_HEIGHT = 700;
export const BASE_Z_INDEX = 1000;
const Z_INDEX_INCREMENT = 1000;
const VERTICAL_OFFSET_RATIO = 0.15; // 15% of viewport height
export const MENU_BAR_HEIGHT = 32; // Menu bar height in pixels

/**
 * Calculate centered position for a new window
 */
export function calculateCenteredPosition(
  width: number = DEFAULT_WINDOW_WIDTH,
  height: number = DEFAULT_WINDOW_HEIGHT
): WindowPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const centeredX = Math.max(0, (viewportWidth - width) / 2);
  const verticalOffset = viewportHeight * VERTICAL_OFFSET_RATIO;
  const centeredY = Math.max(0, (viewportHeight - height) / 2 - verticalOffset);

  return { x: centeredX, y: centeredY };
}

/**
 * Calculate the maximum z-index from window states
 */
export function getMaxZIndex(
  windowStates: Array<{ zIndex: number }>,
  fallback: number = BASE_Z_INDEX - 1
): number {
  return windowStates.reduce((max, ws) => Math.max(max, ws.zIndex), fallback);
}

/**
 * Calculate next z-index for a new or focused window
 */
export function calculateNextZIndex(
  currentMaxZIndex: number,
  nextZIndex: number = BASE_Z_INDEX
): number {
  return Math.max(currentMaxZIndex + Z_INDEX_INCREMENT, nextZIndex);
}

/**
 * Get default window size
 */
export function getDefaultWindowSize(): WindowSize {
  return {
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
  };
}

/**
 * Get maximized window size (accounting for menu bar)
 */
export function getMaximizedWindowSize(): WindowSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight - MENU_BAR_HEIGHT,
  };
}

/**
 * Get maximized window position (below menu bar)
 */
export function getMaximizedWindowPosition(): WindowPosition {
  return {
    x: 0,
    y: MENU_BAR_HEIGHT,
  };
}
