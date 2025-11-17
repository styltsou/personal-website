/**
 * Window-related type definitions
 * Central location for all window domain types
 */

import type { AppConfig } from './app';

/**
 * Window position coordinates
 */
export interface WindowPosition {
  x: number;
  y: number;
}

/**
 * Window size dimensions
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Side to which a window can be snapped
 */
export type SnapSide = 'left' | 'right' | 'top' | null;

/**
 * Complete window state
 */
export interface WindowState {
  id: string;
  config: AppConfig;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  snapSide: SnapSide;
  content?: string;
  isPinned: boolean; // Whether window is pinned (can be changed dynamically, initially from config.pinned)
}

/**
 * Closed window state (without content and transient state)
 * Used for persistence when windows are closed
 */
export interface ClosedWindowState {
  id: string;
  position: WindowPosition;
  size: WindowSize;
  isMaximized: boolean;
}
