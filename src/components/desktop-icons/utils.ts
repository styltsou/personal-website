/**
 * Icon grid utility functions
 * Handles grid calculation, snap-to-grid positioning, and collision detection
 */

import { TASKBAR_HEIGHT } from '@/constants';
import type { GridDimensions, PixelPosition, GridPosition } from '@/types/icon';

export const GRID_CELL_SIZE = 100; // Grid cell size in pixels (matches icon container size exactly)
export const GRID_PADDING = 20; // Padding from edges in pixels
export const ICON_WIDTH = 100; // Icon container width in pixels (matches grid cell width)
export const ICON_HEIGHT = 100; // Icon container height in pixels (matches grid cell height)
export const ICON_IMAGE_SIZE = 64; // Icon image size in pixels (64x64 for the actual icon image)

/**
 * Calculate grid dimensions based on viewport size
 */
export function calculateGridDimensions(): GridDimensions {
  // Default values for SSR
  if (typeof window === 'undefined') {
    return {
      columns: 10,
      rows: 10,
      startX: GRID_PADDING,
      startY: GRID_PADDING + TASKBAR_HEIGHT,
    };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate available space (viewport minus padding and taskbar)
  const availableWidth = viewportWidth - GRID_PADDING * 2;
  const availableHeight = viewportHeight - GRID_PADDING - TASKBAR_HEIGHT;

  // Calculate grid columns and rows
  const columns = Math.floor(availableWidth / GRID_CELL_SIZE);
  const rows = Math.floor(availableHeight / GRID_CELL_SIZE);

  // Starting position (accounting for padding and taskbar)
  const startX = GRID_PADDING;
  const startY = GRID_PADDING + TASKBAR_HEIGHT;

  return {
    columns: Math.max(1, columns), // At least 1 column
    rows: Math.max(1, rows), // At least 1 row
    startX,
    startY,
  };
}

/**
 * Convert pixel position to nearest grid cell coordinates
 */
export function snapToGrid(pixelX: number, pixelY: number): GridPosition {
  const { startX, startY } = calculateGridDimensions();

  // Calculate grid coordinates (accounting for start position)
  const gridX = Math.round((pixelX - startX) / GRID_CELL_SIZE);
  const gridY = Math.round((pixelY - startY) / GRID_CELL_SIZE);

  return {
    gridX: Math.max(0, gridX), // Ensure non-negative
    gridY: Math.max(0, gridY), // Ensure non-negative
  };
}

/**
 * Convert grid coordinates to pixel position
 */
export function gridToPixel(gridX: number, gridY: number): PixelPosition {
  const { startX, startY } = calculateGridDimensions();

  return {
    x: startX + gridX * GRID_CELL_SIZE,
    y: startY + gridY * GRID_CELL_SIZE,
  };
}

/**
 * Constrain grid position to valid bounds
 */
export function constrainGridPosition(
  gridX: number,
  gridY: number
): GridPosition {
  const { columns, rows } = calculateGridDimensions();

  return {
    gridX: Math.max(0, Math.min(gridX, columns - 1)),
    gridY: Math.max(0, Math.min(gridY, rows - 1)),
  };
}

/**
 * Create a set of occupied grid cells from icon positions
 * Format: Set<string> where each string is "gridX,gridY"
 */
export function getOccupiedCells(
  iconPositions: Array<{ gridX: number; gridY: number }>
): Set<string> {
  const occupied = new Set<string>();
  iconPositions.forEach(pos => {
    const key = `${pos.gridX},${pos.gridY}`;
    occupied.add(key);
  });
  return occupied;
}

/**
 * Check if a grid cell is occupied
 */
export function isCellOccupied(
  gridX: number,
  gridY: number,
  occupiedCells: Set<string>
): boolean {
  const key = `${gridX},${gridY}`;
  return occupiedCells.has(key);
}

/**
 * Find the nearest free cell to the target position using Manhattan distance
 * Returns the target position if it's free, otherwise the nearest free cell
 */
export function findNearestFreeCell(
  targetGridX: number,
  targetGridY: number,
  occupiedCells: Set<string>,
  excludeGridX?: number,
  excludeGridY?: number
): GridPosition {
  // If target cell is free, return it
  const excludeKey =
    excludeGridX !== undefined && excludeGridY !== undefined
      ? `${excludeGridX},${excludeGridY}`
      : null;
  const targetKey = `${targetGridX},${targetGridY}`;
  const isTargetExcluded = excludeKey === targetKey;
  if (!occupiedCells.has(targetKey) || isTargetExcluded) {
    return { gridX: targetGridX, gridY: targetGridY };
  }

  // Constrain search to valid grid bounds
  const { columns, rows } = calculateGridDimensions();
  const maxSearchRadius = Math.max(columns, rows);

  // Search in expanding radius (Manhattan distance)
  for (let radius = 1; radius <= maxSearchRadius; radius++) {
    // Check all cells at this distance
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check cells at exactly this Manhattan distance
        if (Math.abs(dx) + Math.abs(dy) !== radius) continue;

        const checkX = targetGridX + dx;
        const checkY = targetGridY + dy;

        // Skip if out of bounds
        if (checkX < 0 || checkX >= columns || checkY < 0 || checkY >= rows) {
          continue;
        }

        // Skip if this is the excluded cell
        const checkKey = `${checkX},${checkY}`;
        if (excludeKey === checkKey) continue;

        // If this cell is free, return it
        if (!occupiedCells.has(checkKey)) {
          return { gridX: checkX, gridY: checkY };
        }
      }
    }
  }

  // If no free cell found (shouldn't happen in practice), return constrained target
  return constrainGridPosition(targetGridX, targetGridY);
}

/**
 * Constrain pixel position to viewport bounds (accounting for grid padding and taskbar)
 */
export function constrainToViewport(position: PixelPosition): PixelPosition {
  // Return position as-is during SSR
  if (typeof window === 'undefined') {
    return position;
  }

  const { startX, startY } = calculateGridDimensions();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate bounds (grid area)
  const maxX = viewportWidth - GRID_PADDING - ICON_WIDTH;
  const maxY = viewportHeight - GRID_PADDING - ICON_HEIGHT;

  return {
    x: Math.max(startX, Math.min(position.x, maxX)),
    y: Math.max(startY, Math.min(position.y, maxY)),
  };
}
