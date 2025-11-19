/**
 * Snake Game Icon Component
 * SVG icon for the Snake Game app
 */

import type { ReactNode } from 'react';

export const SnakeIcon = (): ReactNode => (
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
      fill="#f8f5ed"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Game area background */}
    <rect x="10" y="14" width="44" height="36" rx="2" fill="#1a1a1a" />
    {/* Grid lines - subtle */}
    <line
      x1="18"
      y1="18"
      x2="50"
      y2="18"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <line
      x1="18"
      y1="26"
      x2="50"
      y2="26"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <line
      x1="18"
      y1="34"
      x2="50"
      y2="34"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <line
      x1="18"
      y1="42"
      x2="50"
      y2="42"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <line
      x1="18"
      y1="18"
      x2="18"
      y2="46"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <line
      x1="26"
      y1="18"
      x2="26"
      y2="46"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <line
      x1="34"
      y1="18"
      x2="34"
      y2="46"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <line
      x1="42"
      y1="18"
      x2="42"
      y2="46"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    <line
      x1="50"
      y1="18"
      x2="50"
      y2="46"
      stroke="#2a2a2a"
      strokeWidth="0.5"
      opacity="0.5"
    />
    {/* Snake body segments - using accent color */}
    <rect
      x="14"
      y="30"
      width="6"
      height="6"
      fill="#f09c7c"
      stroke="#d87a5a"
      strokeWidth="0.5"
      rx="0.5"
    />
    <rect
      x="22"
      y="30"
      width="6"
      height="6"
      fill="#f09c7c"
      stroke="#d87a5a"
      strokeWidth="0.5"
      rx="0.5"
    />
    <rect
      x="30"
      y="30"
      width="6"
      height="6"
      fill="#f09c7c"
      stroke="#d87a5a"
      strokeWidth="0.5"
      rx="0.5"
    />
    {/* Snake head - darker accent color */}
    <rect
      x="38"
      y="30"
      width="6"
      height="6"
      fill="#d87a5a"
      stroke="#c05a3a"
      strokeWidth="0.5"
      rx="0.5"
    />
    {/* Snake eye */}
    <circle cx="40" cy="32" r="1" fill="#ffffff" />
    {/* Food - using accent color */}
    <circle
      cx="46"
      cy="38"
      r="3"
      fill="#f09c7c"
      stroke="#d87a5a"
      strokeWidth="0.5"
    />
    {/* Food highlight */}
    <circle cx="45" cy="37" r="1" fill="#ffffff" opacity="0.6" />
  </svg>
);
