/**
 * Photos Icons
 * SVG icons for the Photos app and image files
 */

import type { ReactNode } from 'react';
import { FileIcon } from '@/components/ui/file-icon';

/**
 * Photos app icon - camera icon
 */
export const PhotosIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Camera body */}
    <rect
      x="14"
      y="18"
      width="36"
      height="28"
      rx="3"
      fill="#f8f5ed"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Camera lens */}
    <circle cx="32" cy="32" r="10" fill="#1a1a1a" />
    <circle cx="32" cy="32" r="7" fill="#7da3d1" />
    <circle cx="32" cy="32" r="4" fill="#1a1a1a" />
    {/* Viewfinder */}
    <rect
      x="20"
      y="12"
      width="24"
      height="8"
      rx="2"
      fill="#d4c4b0"
      stroke="#1a1a1a"
      strokeWidth="1.5"
    />
    {/* Flash */}
    <circle cx="44" cy="22" r="3" fill="#ffd700" />
    {/* Photo corner (representing a photo) */}
    <path
      d="M 48 24 L 56 24 L 56 32 L 48 32 Z"
      fill="#f8f5ed"
      stroke="#d4c4b0"
      strokeWidth="1.5"
    />
    <path
      d="M 50 26 L 54 26 L 54 30 L 50 30 Z"
      fill="#7da3d1"
    />
  </svg>
);

/**
 * Image file icon - photo frame icon for image files on desktop
 */
export const ImageFileIcon = (): ReactNode => (
  <FileIcon>
    {/* Image representation - simple landscape scene */}
    {/* Sky */}
    <rect x="16" y="14" width="32" height="20" fill="#7da3d1" />
    {/* Sun */}
    <circle cx="40" cy="20" r="4" fill="#ffd700" />
    {/* Ground/hills */}
    <path
      d="M 16 34 L 20 36 L 24 34 L 28 38 L 32 34 L 36 36 L 40 34 L 44 38 L 48 34 Z"
      fill="#8b9a6b"
      stroke="#6b7a5b"
      strokeWidth="1"
    />
    {/* Photo border inside */}
    <rect
      x="18"
      y="16"
      width="28"
      height="20"
      fill="none"
      stroke="#d4c4b0"
      strokeWidth="1"
    />
  </FileIcon>
);


