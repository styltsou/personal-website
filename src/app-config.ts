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
import MusicPlayer, { MusicPlayerIcon } from './components/apps/music-player';
import { AboutIcon } from './components/apps/about/icon';
import { ProjectsIcon } from './components/apps/projects/icon';
import { ContactIcon } from './components/apps/contact/icon';

export const apps: AppConfig[] = [
  {
    id: 'about',
    title: 'ABOUT.md',
    path: '/about',
    desktopIcon: {
      label: 'ABOUT.md',
      icon: AboutIcon,
    },
  },
  {
    id: 'projects',
    title: 'Projects',
    path: '/projects',
    desktopIcon: {
      icon: ProjectsIcon,
    },
  },
  {
    id: 'contact',
    title: 'Contact',
    path: '/contact',
    desktopIcon: {
      icon: ContactIcon,
    },
  },
  {
    id: 'cv',
    title: 'CV',
    component: CvWindow,
    desktopIcon: {
      label: 'cv.pdf',
      icon: CvIcon,
    },
  },
  {
    id: 'terminal',
    title: 'Terminal',
    component: TerminalWindow,
    desktopIcon: {
      icon: TerminalIcon,
    },
  },
  {
    id: 'wikipedia',
    title: 'Wikipedia',
    component: WikipediaWindow,
    desktopIcon: {
      icon: WikipediaIcon,
    },
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    component: FlappyBirdWindow,
    desktopIcon: {
      icon: FlappyBirdIcon,
    },
  },
  {
    id: 'music-player',
    title: 'MusicPlayer Pro v1.0',
    minSize: { width: 900, height: 700 }, // Larger minimum size for better vinyl display
    component: MusicPlayer,
    desktopIcon: {
      label: 'Music',
      icon: MusicPlayerIcon,
    },
  },
  {
    id: 'piano',
    title: 'Virtual Piano',
    resizable: false,
    component: PianoWindow,
    desktopIcon: {
      label: 'Piano',
      icon: PianoIcon,
    },
  },
];
