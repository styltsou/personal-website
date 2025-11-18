/**
 * Projects Icon Component
 * SVG icon for the Projects app
 */

import type { ReactNode } from 'react';

export const ProjectsIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Folder body - taller */}
    <path
      d="M 10 14 L 10 52 L 54 52 L 54 20 L 34 20 L 30 14 Z"
      fill="#fadf8a"
      stroke="#e5c05a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Folder tab - more prominent */}
    <path
      d="M 10 14 L 30 14 L 34 20 L 10 20 Z"
      fill="#fadf8a"
      stroke="#e5c05a"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Tab highlight */}
    <path d="M 12 14 L 28 14 L 32 20 L 12 20 Z" fill="#fce8b3" opacity="0.6" />
  </svg>
);
