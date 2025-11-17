/**
 * Icon-related type definitions
 * Central location for all icon domain types
 */

import { type ComponentType } from 'react';

/**
 * Icon position in grid coordinates
 */
export interface IconPosition {
  gridX: number;
  gridY: number;
}

/**
 * Icon state (position and metadata)
 */
export interface IconState {
  id: string;
  position: IconPosition;
}

/**
 * Icon configuration for desktop icons
 * Represents a desktop icon that can be displayed and opened
 */
export interface IconConfig {
  id: string;
  label: string;
  icon: string | ComponentType; // Icon component (React component) or image path
  windowId?: string; // Optional window ID to open on double-click (for app icons)
  filePath?: string; // Optional file path to open (for file icons)
}

/**
 * Grid dimensions for icon layout
 */
export interface GridDimensions {
  columns: number;
  rows: number;
  startX: number;
  startY: number;
}

/**
 * Pixel position coordinates
 */
export interface PixelPosition {
  x: number;
  y: number;
}

/**
 * Grid position coordinates
 */
export interface GridPosition {
  gridX: number;
  gridY: number;
}
