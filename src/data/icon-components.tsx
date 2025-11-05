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
    <rect x="44" y="44" width="8" height="2" fill="#00ff00" />
  </svg>
);

export const WikipediaIcon = (): React.ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer retro bezel */}
    <rect
      x="6"
      y="10"
      width="52"
      height="44"
      rx="6"
      fill="#e5e3d9"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* Wikipedia globe/logo shape */}
    <circle
      cx="32"
      cy="32"
      r="18"
      fill="#fff"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* Wikipedia puzzle pieces / W pattern */}
    <path
      d="M 24 28 L 28 36 L 32 28 L 36 36 L 40 28"
      stroke="#7da3d1"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Additional decorative elements */}
    <circle cx="32" cy="32" r="2" fill="#7da3d1" />
    {/* Text lines below */}
    <rect x="20" y="42" width="24" height="2" rx="1" fill="#7da3d1" />
    <rect x="22" y="46" width="20" height="2" rx="1" fill="#b8b8b8" />
  </svg>
);

export const FlappyBirdIcon = (): React.ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sky background */}
    <rect
      x="8"
      y="8"
      width="48"
      height="48"
      rx="4"
      fill="#87ceeb"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* Ground */}
    <rect
      x="8"
      y="48"
      width="48"
      height="8"
      fill="#8b7355"
      stroke="#7da3d1"
      strokeWidth="1"
    />
    {/* Bird (gold/yellow circle) */}
    <ellipse
      cx="24"
      cy="32"
      rx="6"
      ry="8"
      fill="#ffd700"
      stroke="#ffa500"
      strokeWidth="1.5"
    />
    {/* Bird eye */}
    <circle cx="26" cy="30" r="1.5" fill="#000" />
    {/* Pipe */}
    <rect
      x="40"
      y="20"
      width="8"
      height="20"
      fill="#4caf50"
      stroke="#2e7d32"
      strokeWidth="1"
      rx="1"
    />
    <rect
      x="40"
      y="36"
      width="8"
      height="12"
      fill="#4caf50"
      stroke="#2e7d32"
      strokeWidth="1"
      rx="1"
    />
    {/* Pipe cap */}
    <rect
      x="38"
      y="20"
      width="12"
      height="4"
      fill="#66bb6a"
      stroke="#2e7d32"
      strokeWidth="1"
      rx="1"
    />
    <rect
      x="38"
      y="44"
      width="12"
      height="4"
      fill="#66bb6a"
      stroke="#2e7d32"
      strokeWidth="1"
      rx="1"
    />
  </svg>
);
