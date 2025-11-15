/**
 * App configuration type definitions
 * Central location for app-related types
 */

import { type ComponentType } from 'react';
import type { ResizeConstraint } from './window';

/**
 * App configuration interface
 * Defines metadata and behavior for desktop apps
 */
export interface AppConfig {
  id: string;
  title: string;
  path?: string; // Optional path for content-based apps (e.g., '/about')
  icon?: string;
  pinned?: boolean;
  resizeConstraint?: ResizeConstraint;
  component?: ComponentType; // Optional custom React component for this app
  desktopIcon?: {
    label?: string; // Optional label, defaults to app title if not provided
    icon: string | ComponentType; // Icon component (React component) or image path
  };
}

