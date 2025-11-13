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


export const FlappyBirdIcon = (): React.ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Sky background */}
    <rect
      x="8"
      y="8"
      width="48"
      height="48"
      rx="4"
      fill="#87ceeb"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* Ground */}
    <rect
      x="8"
      y="48"
      width="48"
      height="8"
      fill="#8b7355"
      stroke="#7da3d1"
      strokeWidth="1"
    />
    {/* Bird (gold/yellow circle) */}
    <ellipse
      cx="24"
      cy="32"
      rx="6"
      ry="8"
      fill="#ffd700"
      stroke="#ffa500"
      strokeWidth="1.5"
    />
    {/* Bird eye */}
    <circle cx="26" cy="30" r="1.5" fill="#000" />
    {/* Pipe */}
    <rect
      x="40"
      y="20"
      width="8"
      height="20"
      fill="#4caf50"
      stroke="#2e7d32"
      strokeWidth="1"
      rx="1"
    />
    <rect
      x="40"
      y="36"
      width="8"
      height="12"
      fill="#4caf50"
      stroke="#2e7d32"
      strokeWidth="1"
      rx="1"
    />
    {/* Pipe cap */}
    <rect
      x="38"
      y="20"
      width="12"
      height="4"
      fill="#66bb6a"
      stroke="#2e7d32"
      strokeWidth="1"
      rx="1"
    />
    <rect
      x="38"
      y="44"
      width="12"
      height="4"
      fill="#66bb6a"
      stroke="#2e7d32"
      strokeWidth="1"
      rx="1"
      />    
  </svg>
);


export const MusicPlayerIcon = (): React.ReactNode => (
   <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#7da3d1"
      d="M23.994 6.124a9.2 9.2 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5 5 0 0 0-1.877-.726a10.5 10.5 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986q-.227.014-.455.026c-.747.043-1.49.123-2.193.4c-1.336.53-2.3 1.452-2.865 2.78c-.192.448-.292.925-.363 1.408a11 11 0 0 0-.1 1.18c0 .032-.007.062-.01.093v12.223l.027.424c.05.815.154 1.624.497 2.373c.65 1.42 1.738 2.353 3.234 2.801c.42.127.856.187 1.293.228c.555.053 1.11.06 1.667.06h11.03a13 13 0 0 0 1.57-.1c.822-.106 1.596-.35 2.295-.81a5.05 5.05 0 0 0 1.88-2.207c.186-.42.293-.87.37-1.324c.113-.675.138-1.358.137-2.04c-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206c-.29.59-.76.962-1.388 1.14q-.524.15-1.07.173c-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 0 1 1.038-2.022c.323-.16.67-.25 1.018-.324c.378-.082.758-.153 1.134-.24c.274-.063.457-.23.51-.516a1 1 0 0 0 .02-.193q0-2.723-.002-5.443a.7.7 0 0 0-.026-.185c-.04-.15-.15-.243-.304-.234c-.16.01-.318.035-.475.066q-1.14.226-2.28.456l-2.325.47l-1.374.278l-.048.013c-.277.077-.377.203-.39.49q-.002.063 0 .13c-.002 2.602 0 5.204-.003 7.805c0 .42-.047.836-.215 1.227c-.278.64-.77 1.04-1.434 1.233q-.526.152-1.075.172c-.96.036-1.755-.6-1.92-1.544c-.14-.812.23-1.685 1.154-2.075c.357-.15.73-.232 1.108-.31c.287-.06.575-.116.86-.177q.574-.126.6-.714v-.15l.002-8.882c0-.123.013-.25.042-.37c.07-.285.273-.448.546-.518c.255-.066.515-.112.774-.165q1.1-.224 2.2-.444l2.27-.46l2.01-.403c.22-.043.442-.088.663-.106c.31-.025.523.17.554.482q.012.11.012.223q.003 2.866 0 5.732z"
    />
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

export const PianoIcon = (): React.ReactNode => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Piano body/frame */}
    <rect
      x="8"
      y="16"
      width="48"
      height="40"
      rx="2"
      fill="#f8f5ed"
      stroke="#7da3d1"
      strokeWidth="2"
    />
    {/* White keys */}
    <rect x="10" y="20" width="6" height="32" rx="1" fill="#ffffff" stroke="#d4c4b0" strokeWidth="1" />
    <rect x="16" y="20" width="6" height="32" rx="1" fill="#ffffff" stroke="#d4c4b0" strokeWidth="1" />
    <rect x="22" y="20" width="6" height="32" rx="1" fill="#ffffff" stroke="#d4c4b0" strokeWidth="1" />
    <rect x="28" y="20" width="6" height="32" rx="1" fill="#ffffff" stroke="#d4c4b0" strokeWidth="1" />
    <rect x="34" y="20" width="6" height="32" rx="1" fill="#ffffff" stroke="#d4c4b0" strokeWidth="1" />
    <rect x="40" y="20" width="6" height="32" rx="1" fill="#ffffff" stroke="#d4c4b0" strokeWidth="1" />
    <rect x="46" y="20" width="6" height="32" rx="1" fill="#ffffff" stroke="#d4c4b0" strokeWidth="1" />
    {/* Black keys */}
    <rect x="13" y="20" width="4" height="20" rx="1" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="1" />
    <rect x="19" y="20" width="4" height="20" rx="1" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="1" />
    <rect x="31" y="20" width="4" height="20" rx="1" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="1" />
    <rect x="37" y="20" width="4" height="20" rx="1" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="1" />
    <rect x="43" y="20" width="4" height="20" rx="1" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="1" />
    {/* Piano stand */}
    <rect x="20" y="56" width="24" height="4" rx="1" fill="#7da3d1" stroke="#5a8bb8" strokeWidth="1" />
    <rect x="24" y="60" width="16" height="2" rx="1" fill="#5a8bb8" />
  </svg>
);
