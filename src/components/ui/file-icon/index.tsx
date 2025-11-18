/**
 * Generic File Icon Component
 * Base SVG structure for file icons with consistent sizing and styling
 * Accepts children for custom content inside the document
 */

import type { ReactNode } from 'react';

export interface FileIconProps {
  children?: ReactNode;
}

/**
 * Generic file icon - document/paper shape with folded corner
 * All file icons should use this base component for consistency
 * Uses taller dimensions (y=8, height=52) to match About and CV icons
 */
export const FileIcon = ({ children }: FileIconProps): ReactNode => (
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
    {/* Folded corner (like a document) */}
    <path
      d="M 44 8 L 52 8 L 52 16 L 44 8 Z"
      fill="#d4c4b0"
      stroke="#d4c4b0"
      strokeWidth="1"
    />
    {/* Custom content (children) */}
    {children}
  </svg>
);

