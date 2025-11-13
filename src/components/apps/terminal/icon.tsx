/**
 * Terminal Icon Component
 * SVG icon for the Terminal app
 */

import type { ReactNode } from 'react';

export const TerminalIcon = (): ReactNode => (
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
      rx="4"
      fill="#e5e3d9"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* Screen */}
    <rect
      x="12"
      y="18"
      width="40"
      height="28"
      fill="#1a1a1a"
      rx="2"
    />
    {/* Terminal text lines */}
    <line
      x1="16"
      y1="24"
      x2="28"
      y2="24"
      stroke="#00ff00"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="30"
      x2="32"
      y2="30"
      stroke="#00ff00"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="16"
      y1="36"
      x2="24"
      y2="36"
      stroke="#00ff00"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Cursor */}
    <rect
      x="24"
      y="35"
      width="2"
      height="3"
      fill="#00ff00"
    />
    {/* Terminal prompt symbol */}
    <circle
      cx="18"
      cy="24"
      r="1.5"
      fill="#00ff00"
    />
  </svg>
);

