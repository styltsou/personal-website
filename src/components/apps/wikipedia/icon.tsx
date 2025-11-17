/**
 * Wikipedia Icon Component
 * SVG icon for the Wikipedia app
 */

import type { ReactNode } from 'react';

export const WikipediaIcon = (): ReactNode => (
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
