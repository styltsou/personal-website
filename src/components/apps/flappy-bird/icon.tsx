/**
 * Flappy Bird Icon Component
 * SVG icon for the Flappy Bird app
 */

import type { ReactNode } from 'react';

export const FlappyBirdIcon = (): ReactNode => (
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
    {/* Sky background */}
    <rect
      x="12"
      y="16"
      width="40"
      height="20"
      fill="#87CEEB"
      rx="2"
    />
    {/* Ground */}
    <rect
      x="12"
      y="36"
      width="40"
      height="12"
      fill="#8B7355"
      rx="2"
    />
    {/* Bird (simple representation) */}
    <ellipse
      cx="24"
      cy="28"
      rx="6"
      ry="4"
      fill="#FFD700"
      stroke="#FF8C00"
      strokeWidth="1.5"
    />
    {/* Bird eye */}
    <circle cx="26" cy="27" r="1" fill="#000" />
    {/* Bird beak */}
    <path
      d="M 30 28 L 32 27 L 30 29 Z"
      fill="#FF8C00"
    />
    {/* Pipe (top) */}
    <rect
      x="38"
      y="16"
      width="8"
      height="8"
      fill="#228B22"
      stroke="#006400"
      strokeWidth="1"
      rx="1"
    />
    {/* Pipe (bottom) */}
    <rect
      x="38"
      y="32"
      width="8"
      height="16"
      fill="#228B22"
      stroke="#006400"
      strokeWidth="1"
      rx="1"
    />
  </svg>
);

