/**
 * Unified Configuration
 * Defines available apps and files with their metadata, icons, and window components
 */

import type { AppConfig } from './types/app';

import CvWindow, { CvIcon } from './components/apps/cv';
import TerminalWindow, { TerminalIcon } from './components/apps/terminal';
import PianoWindow, { PianoIcon } from './components/apps/piano';
import SnakeWindow, { SnakeIcon } from './components/apps/snake-game';
import MusicPlayer, { MusicPlayerIcon } from './components/apps/music-player';
import PhotosWindow, {
  PhotosIcon,
  ImageFileIcon,
} from './components/apps/photos';
import PdfViewerWindow, { PdfFileIcon } from './components/apps/pdf-viewer';
import { AboutIcon } from './components/apps/about/icon';
import { ProjectsIcon } from './components/apps/projects/icon';
import { ContactIcon } from './components/apps/contact/icon';

export const apps: AppConfig[] = [
  // Apps
  {
    type: 'app',
    id: 'about',
    title: 'ABOUT.md',
    path: '/about',
    desktopIcon: {
      label: 'ABOUT.md',
      icon: AboutIcon,
    },
  },
  {
    type: 'app',
    id: 'projects',
    title: 'Projects',
    path: '/projects',
    desktopIcon: {
      icon: ProjectsIcon,
    },
  },
  {
    type: 'app',
    id: 'contact',
    title: 'Contact',
    path: '/contact',
    desktopIcon: {
      icon: ContactIcon,
    },
  },
  {
    type: 'app',
    id: 'cv',
    title: 'CV',
    component: CvWindow,
    desktopIcon: {
      label: 'cv.pdf',
      icon: CvIcon,
    },
  },
  {
    type: 'app',
    id: 'terminal',
    title: 'Terminal',
    component: TerminalWindow,
    initialSize: { width: 700, height: 500 }, // Smaller initial window size
    desktopIcon: {
      icon: TerminalIcon,
    },
  },
  {
    type: 'app',
    id: 'snake',
    title: 'Snake Game',
    component: SnakeWindow,
    desktopIcon: {
      label: 'Snake Game',
      icon: SnakeIcon,
    },
  },
  {
    type: 'app',
    id: 'music-player',
    title: 'MusicPlayer Pro v1.0',
    minSize: { width: 900, height: 700 }, // Larger minimum size for better vinyl display
    component: MusicPlayer,
    keepMountedWhenMinimized: true, // Keep mounted for background playback
    desktopIcon: {
      label: 'Music',
      icon: MusicPlayerIcon,
    },
  },
  {
    type: 'app',
    id: 'piano',
    title: 'Virtual Piano',
    resizable: false,
    component: PianoWindow,
    desktopIcon: {
      label: 'Piano',
      icon: PianoIcon,
    },
  },
  {
    type: 'app',
    id: 'photos',
    title: 'Photos',
    component: PhotosWindow,
    keepMountedWhenMinimized: true, // Keep mounted to prevent image reload
    fileExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
    desktopIcon: {
      label: 'Photos',
      icon: PhotosIcon,
    },
  },
  {
    type: 'app',
    id: 'pdf-viewer',
    title: 'PDF Viewer',
    component: PdfViewerWindow,
    keepMountedWhenMinimized: true, // Keep mounted to prevent PDF reload
    fileExtensions: ['.pdf'],
    // PDF viewer only opens via file associations, no desktop icon
  },

  // Files
  // Example: Image file that opens in Photos app
  {
    type: 'file',
    id: 'myself',
    title: 'me.jpg',
    filePath: '/images/me.jpg',
    desktopIcon: {
      label: 'me.jpg',
      icon: ImageFileIcon, // Use SVG icon for retro aesthetic
    },
  },
  {
    type: 'file',
    id: 'pop-gtr-chords',
    title: 'pop-gtr-chords.pdf',
    filePath: '/pdfs/pop-gtr-chords.pdf',
    desktopIcon: {
      label: 'pop-gtr-chords.pdf',
      icon: PdfFileIcon, // Use SVG icon for retro aesthetic
    },
  },
  // Example: Text file that opens in Notepad app (when you create it)
  // {
  //   type: 'file',
  //   id: 'readme',
  //   title: 'readme.txt',
  //   filePath: '/files/readme.txt',
  //   desktopIcon: {
  //     label: 'readme.txt',
  //   },
  // },
];

/**
 * Build file associations map from app configs
 * Maps file extensions to app IDs
 */
export function getFileAssociations(): Record<string, string> {
  const associations: Record<string, string> = {};

  apps.forEach(app => {
    if (app.type === 'app' && app.fileExtensions) {
      app.fileExtensions.forEach(ext => {
        associations[ext.toLowerCase()] = app.id;
      });
    }
  });

  return associations;
}

/**
 * Get the app ID associated with a file extension
 */
export function getAppForFile(filePath: string): string | null {
  const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
  const associations = getFileAssociations();
  return associations[extension] || null;
}

/**
 * Get file extension from file path
 */
export function getFileExtension(filePath: string): string {
  return filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
}
