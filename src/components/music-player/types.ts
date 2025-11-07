/**
 * Type definitions for MusicPlayer Pro v1.0
 */

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string;
  duration: number; // Duration in milliseconds
}

export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  currentTime: number; // Current time in seconds
  duration: number; // Duration in seconds
  volume: number; // Volume 0-100
  currentTrackIndex: number;
}

