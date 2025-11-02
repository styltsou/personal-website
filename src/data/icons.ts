/**
 * Icon configuration for desktop icons
 * Defines available desktop icons with their metadata
 */

import type { ReactNode } from 'react';
import { CvIcon, RecycleBinIcon } from './icon-components';

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
    // windowId can be added later when we implement window opening
  },
  {
    id: 'recycle-bin',
    label: 'Trash',
    icon: RecycleBinIcon,
    // windowId can be added later when we implement window opening
  },
];
