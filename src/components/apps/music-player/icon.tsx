/**
 * Music Player Icon Component
 * SVG icon for the Music Player app
 */

import type { ReactNode } from 'react';

export const MusicPlayerIcon = (): ReactNode => (
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
      fill="#ffffff"
      stroke="#f09c7c"
      strokeWidth="2"
    />
    {/* CD/Disc */}
    <circle
      cx="32"
      cy="28"
      r="12"
      fill="#2a2a2a"
      stroke="#f09c7c"
      strokeWidth="2"
    />
    <circle
      cx="32"
      cy="28"
      r="8"
      fill="none"
      stroke="#555"
      strokeWidth="1"
    />
    <circle
      cx="32"
      cy="28"
      r="3"
      fill="#f09c7c"
    />
    {/* Music note */}
    <path
      d="M 20 42 L 20 38 L 24 40 L 24 44 L 20 42 Z M 24 40 L 28 38 L 28 42"
      stroke="#f09c7c"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Equalizer bars */}
    <rect x="36" y="40" width="2" height="8" rx="1" fill="#f09c7c" />
    <rect x="40" y="38" width="2" height="10" rx="1" fill="#f09c7c" />
    <rect x="44" y="42" width="2" height="6" rx="1" fill="#f09c7c" />
  </svg>
);

