/**
 * Application Configuration
 * Defines available apps with their metadata, icons, and window components
 */

import type { AppConfig } from './types/app';

import CvWindow, { CvIcon } from './components/apps/cv';
import TerminalWindow, { TerminalIcon } from './components/apps/terminal';
import WikipediaWindow, { WikipediaIcon } from './components/apps/wikipedia';
import PianoWindow, { PianoIcon } from './components/apps/piano';
import FlappyBirdWindow, {
  FlappyBirdIcon,
} from './components/apps/flappy-bird';
import {
  MusicPlayerContent,
  MusicPlayerIcon,
} from './components/apps/music-player';

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
