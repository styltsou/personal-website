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
      fill="none"
      stroke="#1a1a1a"
      strokeWidth="2"
    />
    {/* Screen */}
    <rect
      x="7"
      y="11"
      width="50"
      height="42"
      fill="#000000"
      rx="2"
    />
    {/* Terminal chevron right prompt */}
    <path
      d="M 12 18 L 16 22 L 12 26"
      stroke="#00ff00"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Underscore after chevron */}
    <line
      x1="20"
      y1="26"
      x2="28"
      y2="26"
      stroke="#00ff00"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

