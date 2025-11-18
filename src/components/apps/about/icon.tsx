/**
 * About Icon Component
 * SVG icon for the about.md file
 */

import type { ReactNode } from 'react';
import { FileIcon } from '@/components/ui/file-icon';

export const AboutIcon = (): ReactNode => (
  <FileIcon>
    {/* Markdown logo - official SVG logo, normalized and centered */}
    <g transform="translate(32, 34) scale(0.5, -0.5) translate(-24.4, -24)">
      {/* Official markdown logo path - normalized from 500x500 to 50x50 */}
      <path
        d="M1.2 38.8 c-1.7 -1.7 -1.7 -27.9 0 -29.6 1.7 -1.7 45.9 -1.7 47.6 0 1.7 1.7 1.7 27.9 0 29.6 -1.7 1.7 -45.9 1.7 -47.6 0z m13.2 -10 l2.6 -3.3 2.6 3.3 c1.4 1.7 3.4 3.2 4.5 3.2 1.7 0 1.9 -0.8 1.9 -8 0 -7.3 -0.2 -8 -2 -8 -1.7 0 -2 0.7 -2 5.3 l0 5.2 -2.5 -3 -2.5 -3 -2.5 3 -2.5 3 0 -5.2 c0 -4.6 -0.3 -5.3 -2 -5.3 -1.8 0 -2 0.7 -2 8 0 7.2 0.2 8 1.9 8 1.1 0 3.1 -1.5 4.5 -3.2z m24.6 -0.8 c0 -3.7 0.2 -4 2.7 -4 l2.8 0 -3.8 -3.7 -3.7 -3.8 -3.7 3.8 -3.8 3.7 2.8 0 c2.5 0 2.7 0.3 2.7 4 0 3.3 0.3 4 2 4 1.7 0 2 -0.7 2 -4z"
        fill="#7da3d1"
      />
    </g>
  </FileIcon>
);
