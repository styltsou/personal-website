/**
 * Viewport constraint utilities
 * Helper functions for constraining window positions and sizes to viewport
 */

import { MENU_BAR_HEIGHT } from './window-utils';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

const DRAG_TOLERANCE = 100; // Allow dragging off-screen but keep some visible

/**
 * Constrain a position to viewport bounds
 */
export function constrainPositionToViewport(
  position: Position,
  size: Size
): Position {
  const minX = -(size.width - DRAG_TOLERANCE);
  const minY = MENU_BAR_HEIGHT;
  const maxX = window.innerWidth - DRAG_TOLERANCE;
  const maxY = window.innerHeight - DRAG_TOLERANCE;

  return {
    x: Math.max(minX, Math.min(position.x, maxX)),
    y: Math.max(minY, Math.min(position.y, maxY)),
  };
}

/**
 * Constrain a size to viewport bounds based on position
 */
export function constrainSizeToViewport(
  size: Size,
  position: Position,
  minSize?: Size
): Size {
  const maxWidth = window.innerWidth - position.x + DRAG_TOLERANCE;
  const maxHeight = window.innerHeight - position.y + DRAG_TOLERANCE;

  const width = minSize
    ? Math.max(minSize.width, Math.min(size.width, maxWidth))
    : Math.min(size.width, maxWidth);
  const height = minSize
    ? Math.max(minSize.height, Math.min(size.height, maxHeight))
    : Math.min(size.height, maxHeight);

  return { width, height };
}
