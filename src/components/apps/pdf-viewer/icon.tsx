/**
 * PDF Viewer Icons
 * SVG icons for the PDF viewer app and PDF files
 */

import type { ReactNode } from 'react';
import { FileIcon } from '@/components/ui/file-icon';

/**
 * PDF viewer app icon - document viewer icon
 */
export const PdfViewerIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Document/viewer body */}
    <rect
      x="14"
      y="12"
      width="36"
      height="40"
      rx="2"
      fill="#f8f5ed"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Document pages representation */}
    <rect
      x="18"
      y="16"
      width="28"
      height="32"
      rx="1"
      fill="white"
      stroke="#d4c4b0"
      strokeWidth="1"
    />
    {/* Text lines */}
    <line
      x1="22"
      y1="22"
      x2="42"
      y2="22"
      stroke="#7da3d1"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="22"
      y1="28"
      x2="38"
      y2="28"
      stroke="#7da3d1"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="22"
      y1="34"
      x2="40"
      y2="34"
      stroke="#7da3d1"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Magnifying glass (viewer icon) */}
    <circle
      cx="44"
      cy="20"
      r="8"
      fill="none"
      stroke="#1a1a1a"
      strokeWidth="2"
    />
    <line
      x1="50"
      y1="26"
      x2="56"
      y2="32"
      stroke="#1a1a1a"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * PDF file icon - document icon for PDF files on desktop
 */
export const PdfFileIcon = (): ReactNode => (
  <FileIcon>
    {/* PDF text representation */}
    <text
      x="32"
      y="30"
      fontSize="12"
      fill="#1a1a1a"
      textAnchor="middle"
      fontFamily="monospace"
      fontWeight="bold"
    >
      PDF
    </text>
    {/* Document lines */}
    <line
      x1="18"
      y1="36"
      x2="46"
      y2="36"
      stroke="#7da3d1"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="40"
      x2="44"
      y2="40"
      stroke="#7da3d1"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="44"
      x2="42"
      y2="44"
      stroke="#7da3d1"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </FileIcon>
);
