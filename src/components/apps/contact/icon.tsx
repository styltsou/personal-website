/**
 * Contact Icon Component
 * SVG icon for the Contact app
 */

import type { ReactNode } from 'react';

export const ContactIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* @ symbol */}
    <text
      x="32"
      y="40"
      fontSize="56"
      fontFamily="Arial, sans-serif"
      fontWeight="normal"
      fill="#7da3d1"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      @
    </text>
  </svg>
);

