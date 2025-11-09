/**
 * Window configuration for the desktop manager
 * Defines available windows with their metadata
 */

export interface WindowConfig {
  id: string;
  title: string;
  path: string;
  icon?: string;
  pinned?: boolean; // If true, always shown in menu bar. If false, only shown when window is open.
}

export const windows: WindowConfig[] = [
  { id: 'about', title: 'About Me', path: '/about', pinned: true },
  { id: 'projects', title: 'Projects', path: '/projects', pinned: true },
  { id: 'contact', title: 'Contact', path: '/contact', pinned: true },
  { id: 'terminal', title: 'Terminal', path: '', pinned: false },
  { id: 'wikipedia', title: 'Wikipedia', path: '', pinned: false },
  {
    id: 'music-player',
    title: 'MusicPlayer Pro v1.0',
    path: '',
    pinned: false,
  },
];
