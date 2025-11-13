/**
 * App configuration for the desktop manager
 * Defines available apps with their metadata
 */

import { type ComponentType } from 'react';

import CvWindow, { CvIcon } from '../components/apps/cv';
import TerminalWindow, { TerminalIcon } from '../components/apps/terminal';
import WikipediaWindow, { WikipediaIcon } from '../components/apps/wikipedia';
import PianoWindow, { PianoIcon } from '../components/apps/piano';
import FlappyBirdWindow, {
  FlappyBirdIcon,
} from '../components/apps/flappy-bird';
import {
  MusicPlayerContent,
  MusicPlayerIcon,
} from '../components/music-player';

export type ResizeConstraint = 'diagonal' | 'none' | 'disabled';

export interface AppConfig {
  id: string;
  title: string;
  path?: string; // Optional path for content-based apps (e.g., '/about'). Omit for custom component apps
  icon?: string;
  pinned?: boolean;
  resizeConstraint?: ResizeConstraint; // Resize behavior: 'none' (full resize, default), 'diagonal' (corners only), 'disabled' (no resize)
  component?: ComponentType; // Optional custom React component for this app
  desktopIcon?: {
    label?: string; // Optional label, defaults to app title if not provided
    icon: string | ComponentType; // Icon component (React component) or image path
  }; // If provided, this app will appear as a desktop icon
}

export const apps: AppConfig[] = [
  { id: 'about', title: 'About Me', path: '/about', pinned: true },
  { id: 'projects', title: 'Projects', path: '/projects', pinned: true },
  { id: 'contact', title: 'Contact', path: '/contact', pinned: true },
  {
    id: 'cv',
    title: 'CV',
    pinned: false,
    component: CvWindow,
    desktopIcon: {
      label: 'cv.pdf',
      icon: CvIcon,
    },
  },
  {
    id: 'terminal',
    title: 'Terminal',
    pinned: false,
    component: TerminalWindow,
    desktopIcon: {
      icon: TerminalIcon,
    },
  },
  {
    id: 'wikipedia',
    title: 'Wikipedia',
    pinned: false,
    component: WikipediaWindow,
    desktopIcon: {
      icon: WikipediaIcon,
    },
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    pinned: false,
    resizeConstraint: 'diagonal',
    component: FlappyBirdWindow,
    desktopIcon: {
      icon: FlappyBirdIcon,
    },
  },
  {
    id: 'music-player',
    title: 'MusicPlayer Pro v1.0',
    pinned: false,
    component: MusicPlayerContent,
    desktopIcon: {
      label: 'Music',
      icon: MusicPlayerIcon,
    },
  },
  {
    id: 'piano',
    title: 'Virtual Piano',
    pinned: false,
    resizeConstraint: 'disabled',
    component: PianoWindow,
    desktopIcon: {
      label: 'Piano',
      icon: PianoIcon,
    },
  },
];
