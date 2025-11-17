/**
 * About Icon Component
 * SVG icon for the about.md file
 */

import type { ReactNode } from 'react';

export const AboutIcon = (): ReactNode => (
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
    {/* Markdown header line (h1 style) */}
    <line
      x1="18"
      y1="20"
      x2="42"
      y2="20"
      stroke="#7da3d1"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Markdown text lines */}
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
    {/* Markdown list item (bullet) */}
    <circle
      cx="20"
      cy="42"
      r="2"
      fill="#7da3d1"
    />
    <line
      x1="26"
      y1="42"
      x2="42"
      y2="42"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Code block indicator */}
    <rect
      x="18"
      y="48"
      width="24"
      height="8"
      rx="1"
      fill="#e8e8e8"
      stroke="#7da3d1"
      strokeWidth="1"
    />
  </svg>
);

