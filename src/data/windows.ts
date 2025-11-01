/**
 * Window configuration for the desktop manager
 * Defines available windows with their metadata
 */

export interface WindowConfig {
  id: string;
  title: string;
  path: string;
  icon?: string;
}

export const windows: WindowConfig[] = [
  { id: 'about', title: 'About Me', path: '/about' },
  { id: 'projects', title: 'Projects', path: '/projects' },
  { id: 'contact', title: 'Contact', path: '/contact' },
];
