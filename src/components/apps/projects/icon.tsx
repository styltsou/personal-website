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
    {/* Folder body - taller and more conventional */}
    <path
      d="M 10 14 L 10 48 L 54 48 L 54 20 L 34 20 L 30 14 Z"
      fill="#f8c94e"
      stroke="#d4a842"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Folder tab - more prominent */}
    <path
      d="M 10 14 L 30 14 L 34 20 L 10 20 Z"
      fill="#f8c94e"
      stroke="#d4a842"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Tab highlight */}
    <path d="M 12 14 L 28 14 L 32 20 L 12 20 Z" fill="#ffd966" opacity="0.6" />
    {/* Document lines inside folder */}
    <line
      x1="18"
      y1="28"
      x2="46"
      y2="28"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="34"
      x2="46"
      y2="34"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="40"
      x2="42"
      y2="40"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
