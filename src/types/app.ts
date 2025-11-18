/**
 * App configuration type definitions
 * Central location for app-related types
 */

import { type ComponentType } from 'react';
import type { WindowSize } from './window';

/**
 * Unified configuration interface for apps and files
 * @template TProps - Type of props to pass to the component (defaults to Record<string, any>)
 */
export interface AppConfig<TProps = Record<string, unknown>> {
  type: 'app' | 'file';
  id: string;
  title: string;

  // File-specific fields (only for type: 'file')
  filePath?: string; // Path to the file (required for type: 'file')

  // App-specific fields (only for type: 'app')
  path?: string; // Optional path for content-based apps (e.g., '/about')
  icon?: string;
  pinned?: boolean;
  resizable?: boolean; // Whether window can be resized (default: true)
  minSize?: WindowSize; // Optional app-specific minimum window size
  initialSize?: WindowSize; // Optional initial window size when opening for the first time
  component?: ComponentType<TProps>; // Optional custom React component for this app
  props?: TProps; // Optional props to pass to the component
  keepMountedWhenMinimized?: boolean; // Whether to keep component mounted when minimized (default: false)

  // Desktop icon configuration (for both apps and files)
  desktopIcon?: {
    label?: string; // Optional label, defaults to title if not provided
    icon: string | ComponentType; // Icon component (React component) or image path
  };
}
