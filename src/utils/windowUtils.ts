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

const DEFAULT_WINDOW_WIDTH = 1100;
const DEFAULT_WINDOW_HEIGHT = 800;
const MIN_WINDOW_WIDTH = 800;
const MIN_WINDOW_HEIGHT = 600;
export const BASE_Z_INDEX = 1000;
const Z_INDEX_INCREMENT = 1000;
const VERTICAL_OFFSET_RATIO = 0.15; // 15% of viewport height
export const MENU_BAR_HEIGHT = 32; // Menu bar height in pixels
const CASCADE_OFFSET_X = 40; // Horizontal offset for cascading windows (px)
const CASCADE_OFFSET_Y = 40; // Vertical offset for cascading windows (px)
const POSITION_TOLERANCE = 5; // Tolerance for comparing positions (px)

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
 * Get minimum window size
 */
export function getMinWindowSize(): WindowSize {
  return {
    width: MIN_WINDOW_WIDTH,
    height: MIN_WINDOW_HEIGHT,
  };
}

/**
 * Constrain window size to minimum and maximum bounds
 */
export function constrainWindowSize(size: WindowSize): WindowSize {
  const minSize = getMinWindowSize();
  return {
    width: Math.max(minSize.width, size.width),
    height: Math.max(minSize.height, size.height),
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

/**
 * Check if two positions are approximately equal (within tolerance)
 */
function positionsEqual(
  pos1: WindowPosition,
  pos2: WindowPosition,
  tolerance: number = POSITION_TOLERANCE
): boolean {
  return (
    Math.abs(pos1.x - pos2.x) <= tolerance &&
    Math.abs(pos1.y - pos2.y) <= tolerance
  );
}

/**
 * Calculate cascaded position for a new window
 * If another window is at the default position, offset this one
 */
export function calculateCascadedPosition(
  defaultPosition: WindowPosition,
  visibleWindows: Array<{ position: WindowPosition; isMaximized: boolean }>,
  width: number = DEFAULT_WINDOW_WIDTH,
  height: number = DEFAULT_WINDOW_HEIGHT
): WindowPosition {
  // Check if any visible window is at the default position
  const hasWindowAtDefaultPosition = visibleWindows.some(
    (ws) => !ws.isMaximized && positionsEqual(ws.position, defaultPosition)
  );

  // If no window is at default position, use default position
  if (!hasWindowAtDefaultPosition) {
    return defaultPosition;
  }

  // Calculate cascaded position (offset from default)
  const cascadedX = defaultPosition.x + CASCADE_OFFSET_X;
  const cascadedY = defaultPosition.y + CASCADE_OFFSET_Y;

  // Ensure the cascaded window stays within viewport bounds
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const constrainedX = Math.max(0, Math.min(cascadedX, viewportWidth - width));
  const constrainedY = Math.max(
    MENU_BAR_HEIGHT,
    Math.min(cascadedY, viewportHeight - height)
  );

  return { x: constrainedX, y: constrainedY };
}
