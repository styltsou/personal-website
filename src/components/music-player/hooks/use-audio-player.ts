/**
 * Hook for managing HTML5 Audio playback
 * Handles play, pause, stop, seek, volume, and track switching
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Track, AudioState } from '../types';

interface UseAudioPlayerReturn {
  state: AudioState;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

/**
 * Hook to manage audio playback
 * @param tracks - Array of tracks to play
 * @param currentTrackIndex - Index of current track
 * @param onTrackEnd - Callback when track ends (for auto-advance)
 */
export function useAudioPlayer(
  tracks: Track[],
  currentTrackIndex: number,
  onTrackEnd?: (nextIndex: number) => void
): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(50); // 0-100

  // Create audio element for current track
  useEffect(() => {
    if (tracks.length === 0 || currentTrackIndex < 0 || currentTrackIndex >= tracks.length) {
      // Reset state if no valid track
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const track = tracks[currentTrackIndex];
    
    // Clean up previous audio element
    if (audioRef.current) {
      const prevAudio = audioRef.current;
      prevAudio.pause();
      prevAudio.src = '';
      prevAudio.load();
    }

    // Create new audio element
    const audio = new Audio(track.previewUrl);
    audioRef.current = audio;

    // Set volume
    audio.volume = volume / 100;

    // Event handlers
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || track.duration / 1000);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setCurrentTime(0);

      // Auto-advance to next track
      if (onTrackEnd) {
        const nextIndex = currentTrackIndex === tracks.length - 1 ? 0 : currentTrackIndex + 1;
        onTrackEnd(nextIndex);
      }
    };

    const handleError = (e: Event) => {
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      console.error('Audio playback error:', e);
      // Try to get error details if available
      if (audio.error) {
        console.error('Audio error code:', audio.error.code, 'message:', audio.error.message);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Load the track
    audio.load();

    // Cleanup
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.pause();
        audio.src = '';
        audio.load();
        audioRef.current = null;
      }
    };
  }, [tracks, currentTrackIndex, volume, onTrackEnd]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
        setIsStopped(false);
      }).catch((err) => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
        setIsPaused(false);
        setIsStopped(true);
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      setIsStopped(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setCurrentTime(0);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      }
    };
  }, []);

  return {
    state: {
      isPlaying,
      isPaused,
      isStopped,
      currentTime,
      duration,
      volume,
      currentTrackIndex,
    },
    play,
    pause,
    stop,
    seek,
    setVolume,
  };
}

