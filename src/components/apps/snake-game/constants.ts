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

// Game-specific colors (background, grid, text come from CSS variables)
export const COLORS = {
  light: {
    // Teal/cyan snake - complements warm beige theme
    snake: '#4a9b8a', // Retro teal
    snakeHead: '#2d6d5d', // Darker teal for head
    // Food uses accent color from CSS variables (handled in getThemeColors)
    food: '#f09c7c', // Fallback accent color
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  dark: {
    // Brighter teal for visibility on dark background
    snake: '#5cb8a5', // Bright retro teal
    snakeHead: '#4a9b8a', // Slightly darker teal for head
    // Food uses accent color from CSS variables (handled in getThemeColors)
    food: '#f09c7c', // Fallback accent color
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
};
