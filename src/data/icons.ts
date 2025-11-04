/**
 * Icon configuration for desktop icons
 * Defines available desktop icons with their metadata
 */

import type { ReactNode } from 'react';
import {
  WikipediaIcon,
  CvIcon,
  RecycleBinIcon,
  TerminalIcon,
} from './icon-components.tsx';

export interface IconConfig {
  id: string;
  label: string;
  icon: string | (() => ReactNode);
  windowId?: string; // Optional window ID to open on double-click
}

export const icons: IconConfig[] = [
  {
    id: 'cv',
    label: 'cv.pdf',
    icon: CvIcon,
    // windowId can be added later when we implement window opening and an actual window for it
  },
  {
    id: 'recycle-bin',
    label: 'Trash',
    icon: RecycleBinIcon,
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: TerminalIcon,
    windowId: 'terminal', // Opens terminal window on double-click
  },
  {
    id: 'wikipedia',
    label: 'Wikipedia',
    icon: WikipediaIcon,
    windowId: 'wikipedia',
  },
];
