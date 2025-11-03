/**
 * Icon component definitions
 * SVG icons in 80s style
 */

import type { ReactNode } from 'react';

export const CvIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Paper/document shape */}
    <rect
      x="12"
      y="8"
      width="40"
      height="52"
      rx="2"
      fill="#f8f5ed"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Folded corner */}
    <path
      d="M 44 8 L 52 8 L 52 16 L 44 8 Z"
      fill="#d4c4b0"
      stroke="#d4c4b0"
      strokeWidth="1"
    />
    {/* Lines representing text */}
    <line
      x1="18"
      y1="22"
      x2="42"
      y2="22"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="28"
      x2="42"
      y2="28"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="34"
      x2="38"
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

export const RecycleBinIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Trash can body */}
    <rect
      x="16"
      y="20"
      width="32"
      height="36"
      rx="2"
      fill="#f8f5ed"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Lid */}
    <rect
      x="14"
      y="18"
      width="36"
      height="6"
      rx="1"
      fill="#e8ddd0"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Lid handle */}
    <rect
      x="28"
      y="12"
      width="8"
      height="8"
      rx="1"
      fill="#d4c4b0"
      stroke="#d4c4b0"
      strokeWidth="1"
    />
    {/* Vertical lines for texture */}
    <line
      x1="26"
      y1="28"
      x2="26"
      y2="48"
      stroke="#d4c4b0"
      strokeWidth="1"
      opacity="0.5"
    />
    <line
      x1="32"
      y1="28"
      x2="32"
      y2="48"
      stroke="#d4c4b0"
      strokeWidth="1"
      opacity="0.5"
    />
    <line
      x1="38"
      y1="28"
      x2="38"
      y2="48"
      stroke="#d4c4b0"
      strokeWidth="1"
      opacity="0.5"
    />
  </svg>
);

export const TerminalIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Terminal screen body */}
    <rect
      x="8"
      y="12"
      width="48"
      height="40"
      rx="2"
      fill="#1a1a1a"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Terminal frame/bezel */}
    <rect
      x="6"
      y="10"
      width="52"
      height="44"
      rx="3"
      fill="none"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* Terminal prompt */}
    <line
      x1="14"
      y1="26"
      x2="20"
      y2="26"
      stroke="#00ff00"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Terminal text line 1 */}
    <line
      x1="14"
      y1="32"
      x2="48"
      y2="32"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Terminal text line 2 */}
    <line
      x1="14"
      y1="38"
      x2="42"
      y2="38"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Terminal cursor */}
    <rect
      x="44"
      y="44"
      width="8"
      height="2"
      fill="#00ff00"
    />
  </svg>
);

