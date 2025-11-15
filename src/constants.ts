/**
 * Application-wide constants
 * Centralized location for constants used across multiple modules
 */

// Layout constants
export const MENU_BAR_HEIGHT = 32; // Menu bar height in pixels

// Z-index constants
export const BASE_Z_INDEX = 10; // Windows start at 10
export const MAX_WINDOW_Z_INDEX = 98; // Cap windows at 98 (dragging icon uses 99, menu bar uses 100)
export const DRAGGING_ICON_Z_INDEX = 99; // Dragging icon z-index (above all windows, below menu bar)
export const MENU_BAR_Z_INDEX = 100; // Menu bar z-index (always on top)
export const ICON_Z_INDEX = 1; // Desktop icons z-index (desktop surface, below windows)

