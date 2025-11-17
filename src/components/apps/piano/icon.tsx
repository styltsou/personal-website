/**
 * Piano Icon Component
 * SVG icon for the Piano app
 */

import type { ReactNode } from 'react';

export const PianoIcon = (): ReactNode => (
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
      stroke="#ffffff"
      strokeWidth="2"
    />
    {/* Piano body */}
    <rect x="12" y="20" width="40" height="28" fill="#2a2a2a" rx="2" />
    {/* White keys */}
    <rect x="14" y="22" width="5" height="24" fill="#f5f5f5" rx="1" />
    <rect x="20" y="22" width="5" height="24" fill="#f5f5f5" rx="1" />
    <rect x="26" y="22" width="5" height="24" fill="#f5f5f5" rx="1" />
    <rect x="32" y="22" width="5" height="24" fill="#f5f5f5" rx="1" />
    <rect x="38" y="22" width="5" height="24" fill="#f5f5f5" rx="1" />
    <rect x="44" y="22" width="5" height="24" fill="#f5f5f5" rx="1" />
    {/* Black keys */}
    <rect x="17" y="22" width="3" height="14" fill="#1a1a1a" rx="0.5" />
    <rect x="23" y="22" width="3" height="14" fill="#1a1a1a" rx="0.5" />
    <rect x="35" y="22" width="3" height="14" fill="#1a1a1a" rx="0.5" />
    <rect x="41" y="22" width="3" height="14" fill="#1a1a1a" rx="0.5" />
  </svg>
);
