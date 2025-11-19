/**
 * Window utility functions
 * Helper functions for window calculations and positioning
 */

import type { WindowPosition, WindowSize } from '@/types/window';
import { BASE_Z_INDEX, MAX_WINDOW_Z_INDEX, TASKBAR_HEIGHT } from '@/constants';

const DEFAULT_WINDOW_WIDTH = 1100;
const DEFAULT_WINDOW_HEIGHT = 800;
const MIN_WINDOW_WIDTH = 800;
const MIN_WINDOW_HEIGHT = 600;
const Z_INDEX_INCREMENT = 1; // Increment by 1 per focus (much simpler!)
const VERTICAL_OFFSET_RATIO = 0.15; // 15% of viewport height
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
  const centeredY = Math.max(
    TASKBAR_HEIGHT,
    (viewportHeight - height) / 2 - verticalOffset
  );

  return { x: centeredX, y: centeredY };
}

/**
 * Calculate the maximum z-index from window states
 */
export function getMaxZIndex(
  windows: Array<{ zIndex: number }>,
  fallback: number = BASE_Z_INDEX - 1
): number {
  return windows.reduce(
    (max, window) => Math.max(max, window.zIndex),
    fallback
  );
}

/**
 * Calculate next z-index for a new or focused window
 * Caps at MAX_WINDOW_Z_INDEX to ensure dragging icons (99) stay above
 */
export function calculateNextZIndex(
  currentMaxZIndex: number,
  nextZIndex: number = BASE_Z_INDEX
): number {
  const calculated = Math.max(currentMaxZIndex + Z_INDEX_INCREMENT, nextZIndex);
  // Cap at MAX_WINDOW_Z_INDEX to leave room for dragging icons (99) and taskbar (100)
  return Math.min(calculated, MAX_WINDOW_Z_INDEX);
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
 * Get maximized window size (accounting for taskbar)
 */
export function getMaximizedWindowSize(): WindowSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight - TASKBAR_HEIGHT,
  };
}

/**
 * Get maximized window position (below taskbar)
 */
export function getMaximizedWindowPosition(): WindowPosition {
  return {
    x: 0,
    y: TASKBAR_HEIGHT,
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

// Snap detection constants
const SNAP_THRESHOLD = 16; // Distance in pixels from edge to trigger snap

/**
 * Detect which side a window should snap to based on its position
 * Detects left, right, and top snapping
 * Returns null if no snap should occur
 */
export function detectSnapSide(
  position: WindowPosition,
  size: WindowSize
): 'left' | 'right' | 'top' | null {
  const viewportWidth = window.innerWidth;

  // Check left edge
  const nearLeft =
    position.x <= SNAP_THRESHOLD && position.x >= -SNAP_THRESHOLD;
  // Check right edge
  const nearRight =
    position.x + size.width >= viewportWidth - SNAP_THRESHOLD &&
    position.x + size.width <= viewportWidth + SNAP_THRESHOLD;
  // Check top edge (positioned right at taskbar height)
  const nearTop =
    position.y <= TASKBAR_HEIGHT + SNAP_THRESHOLD &&
    position.y >= TASKBAR_HEIGHT - SNAP_THRESHOLD;

  // Detect edge snaps (top takes priority if both horizontal and vertical are detected)
  if (
    nearTop &&
    size.width === viewportWidth &&
    size.height === window.innerHeight - TASKBAR_HEIGHT
  ) {
    // Only consider it top-snapped if it's also maximized (full width and height)
    return 'top';
  }
  if (nearLeft) return 'left';
  if (nearRight) return 'right';

  return null;
}

/**
 * Detect which side a window should snap to based on mouse cursor position
 * Returns null if no snap should occur
 */
export function detectSnapSideFromMouse(
  mouseX: number,
  mouseY: number
): 'left' | 'right' | 'top' | null {
  const viewportWidth = window.innerWidth;

  // Check if mouse is near left edge
  const nearLeft = mouseX <= SNAP_THRESHOLD && mouseX >= 0;
  // Check if mouse is near right edge
  const nearRight =
    mouseX >= viewportWidth - SNAP_THRESHOLD && mouseX <= viewportWidth;
  // Check if mouse is near top edge (below taskbar)
  const nearTop =
    mouseY >= TASKBAR_HEIGHT && mouseY <= TASKBAR_HEIGHT + SNAP_THRESHOLD;

  // Detect edge snaps (top takes priority if both horizontal and vertical are detected)
  if (nearTop) return 'top';
  if (nearLeft) return 'left';
  if (nearRight) return 'right';

  return null;
}

/**
 * Calculate the snapped position and size for a preview
 */
export function getSnappedPreview(snapSide: 'left' | 'right' | 'top'): {
  position: WindowPosition;
  size: WindowSize;
} {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const halfWidth = viewportWidth / 2;

  let snappedPosition: WindowPosition;
  let snappedSize: WindowSize;

  if (snapSide === 'top') {
    // Top snap = maximize (full width, full height minus taskbar)
    snappedPosition = { x: 0, y: TASKBAR_HEIGHT };
    snappedSize = {
      width: viewportWidth,
      height: viewportHeight - TASKBAR_HEIGHT,
    };
  } else if (snapSide === 'left') {
    snappedPosition = { x: 0, y: TASKBAR_HEIGHT };
    snappedSize = {
      width: halfWidth,
      height: viewportHeight - TASKBAR_HEIGHT,
    };
  } else {
    // snapSide === 'right'
    snappedPosition = { x: halfWidth, y: TASKBAR_HEIGHT };
    snappedSize = {
      width: halfWidth,
      height: viewportHeight - TASKBAR_HEIGHT,
    };
  }

  return { position: snappedPosition, size: snappedSize };
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
    window =>
      !window.isMaximized && positionsEqual(window.position, defaultPosition)
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
    TASKBAR_HEIGHT,
    Math.min(cascadedY, viewportHeight - height)
  );

  return { x: constrainedX, y: constrainedY };
}
