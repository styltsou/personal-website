/**
 * Scaling utilities for canvas rendering
 * Maintains aspect ratio and prevents skewing
 */

import { BASE_WIDTH, BASE_HEIGHT } from '../constants';
import type { GameSize } from '../types';

export interface ScaleInfo {
  scaleX: number;
  scaleY: number;
  scale: number; // Uniform scale (maintains aspect ratio)
  offsetX: number; // Horizontal offset for letterboxing
  offsetY: number; // Vertical offset for pillarboxing
}

/**
 * Calculate scale factor and offsets to maintain aspect ratio
 * Uses letterboxing/pillarboxing approach like most games
 */
export function calculateScale(actualSize: GameSize): ScaleInfo {
  const scaleX = actualSize.width / BASE_WIDTH;
  const scaleY = actualSize.height / BASE_HEIGHT;

  // Use uniform scale to maintain aspect ratio
  const scale = Math.min(scaleX, scaleY);

  // Calculate offsets for centering (letterboxing/pillarboxing)
  const scaledWidth = BASE_WIDTH * scale;
  const scaledHeight = BASE_HEIGHT * scale;
  const offsetX = (actualSize.width - scaledWidth) / 2;
  const offsetY = (actualSize.height - scaledHeight) / 2;

  return {
    scaleX,
    scaleY,
    scale,
    offsetX,
    offsetY,
  };
}

/**
 * Scale a value based on the uniform scale factor
 */
export function scaleValue(value: number, scale: number): number {
  return value * scale;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Scale font size with clamping to prevent extreme sizes
 */
export function scaleFontSize(
  baseSize: number,
  scale: number,
  minSize = 12,
  maxSize = 100
): number {
  return clamp(baseSize * scale, minSize, maxSize);
}
