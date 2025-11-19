/**
 * Game constants and configuration
 */

// Grid configuration
export const GRID_SIZE = 20; // 20x20 grid

// Game speed (milliseconds between updates)
export const GAME_SPEED = 200; // Adjust for difficulty (higher = slower)

// Initial snake position (center of grid)
export const INITIAL_SNAKE: Array<{ x: number; y: number }> = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
