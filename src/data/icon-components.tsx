/**
 * Icon component definitions
 * SVG icons in 80s style
 */

import type { ReactNode } from 'react';

export const CvIcon = (): ReactNode => (
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
    {/* Lines representing text */}
    <line
      x1="18"
      y1="22"
      x2="42"
      y2="22"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
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
    <line
      x1="18"
      y1="40"
      x2="42"
      y2="40"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const RecycleBinIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Trash can body */}
    <rect
      x="16"
      y="20"
      width="32"
      height="36"
      rx="2"
      fill="#f8f5ed"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Lid */}
    <rect
      x="14"
      y="18"
      width="36"
      height="6"
      rx="1"
      fill="#e8ddd0"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Lid handle */}
    <rect
      x="28"
      y="12"
      width="8"
      height="8"
      rx="1"
      fill="#d4c4b0"
      stroke="#d4c4b0"
      strokeWidth="1"
    />
    {/* Vertical lines for texture */}
    <line
      x1="26"
      y1="28"
      x2="26"
      y2="48"
      stroke="#d4c4b0"
      strokeWidth="1"
      opacity="0.5"
    />
    <line
      x1="32"
      y1="28"
      x2="32"
      y2="48"
      stroke="#d4c4b0"
      strokeWidth="1"
      opacity="0.5"
    />
    <line
      x1="38"
      y1="28"
      x2="38"
      y2="48"
      stroke="#d4c4b0"
      strokeWidth="1"
      opacity="0.5"
    />
  </svg>
);

export const TerminalIcon = (): ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Terminal screen body */}
    <rect
      x="8"
      y="12"
      width="48"
      height="40"
      rx="2"
      fill="#1a1a1a"
      stroke="#d4c4b0"
      strokeWidth="2"
    />
    {/* Terminal frame/bezel */}
    <rect
      x="6"
      y="10"
      width="52"
      height="44"
      rx="3"
      fill="none"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* Terminal prompt */}
    <line
      x1="14"
      y1="26"
      x2="20"
      y2="26"
      stroke="#00ff00"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Terminal text line 1 */}
    <line
      x1="14"
      y1="32"
      x2="48"
      y2="32"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Terminal text line 2 */}
    <line
      x1="14"
      y1="38"
      x2="42"
      y2="38"
      stroke="#7da3d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Terminal cursor */}
    <rect x="44" y="44" width="8" height="2" fill="#00ff00" />
  </svg>
);

export const WikipediaIcon = (): React.ReactNode => (
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

export const MusicPlayerIcon = (): React.ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simple music note icon */}
    <circle
      cx="32"
      cy="32"
      r="20"
      fill="#f8f5ed"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* Music note */}
    <path
      d="M 28 20 L 28 40 M 28 20 L 36 20 L 36 30 M 36 30 L 32 30 L 32 40"
      stroke="#7da3d1"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Small circle at bottom */}
    <circle cx="28" cy="42" r="3" fill="#7da3d1" />
    <circle cx="32" cy="42" r="3" fill="#7da3d1" />
  </svg>
);

// Music Player Control Icons
export const PlayIcon = (): React.ReactNode => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 8 5 L 8 19 L 18 12 Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

export const PauseIcon = (): React.ReactNode => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="7"
      y="5"
      width="4"
      height="14"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect
      x="13"
      y="5"
      width="4"
      height="14"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);

export const PreviousIcon = (): React.ReactNode => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 6 6 L 6 18 M 6 6 L 14 12 L 6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M 14 6 L 14 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const NextIcon = (): React.ReactNode => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 18 6 L 18 18 M 18 6 L 10 12 L 18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M 10 6 L 10 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const LoopIcon = ({
  mode,
}: {
  mode: 'none' | 'song' | 'playlist';
}): React.ReactNode => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 7 12 L 4 9 L 7 6 M 17 12 L 20 9 L 17 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M 4 9 L 20 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {mode === 'song' && <circle cx="12" cy="12" r="3" fill="currentColor" />}
    {mode === 'playlist' && (
      <>
        <circle cx="9" cy="12" r="2" fill="currentColor" />
        <circle cx="15" cy="12" r="2" fill="currentColor" />
      </>
    )}
  </svg>
);

export const RefreshIcon = (): React.ReactNode => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 20 8 C 18.5 5.5 15.5 4 12 4 C 7 4 3 8 3 13 C 3 18 7 22 12 22 C 16 22 19.5 19 20.5 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M 20 4 L 20 8 L 16 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);
