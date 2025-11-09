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
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(50); // 0-100
  const previousTrackIndexRef = useRef<number>(-1);
  const previousPlayingStateRef = useRef<boolean>(false);

  // Create audio element for current track
  useEffect(() => {
    if (
      tracks.length === 0 ||
      currentTrackIndex < 0 ||
      currentTrackIndex >= tracks.length
    ) {
      // Reset state if no valid track
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const track = tracks[currentTrackIndex];

    // Skip if no preview URL or if it's a YouTube track (handled by YouTube player)
    if (!track.previewUrl || track.previewUrl.trim() === '') {
      console.warn(`No preview URL for track: ${track.name}`);
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setIsBuffering(false);
      setCurrentTime(0);
      setDuration(track.duration / 1000);
      return;
    }

    // Skip YouTube tracks - they're handled by the YouTube player
    if (track.previewUrl.startsWith('youtube:')) {
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setIsBuffering(false);
      setCurrentTime(0);
      setDuration(track.duration / 1000);
      return;
    }

    // Clean up previous audio element
    if (audioRef.current) {
      const prevAudio = audioRef.current;
      prevAudio.pause();
      prevAudio.src = '';
      prevAudio.load();
    }

    // For non-YouTube tracks, use the preview URL directly
    const audioUrl = track.previewUrl;

    // Check if we should auto-play (if previous track was playing when we switched)
    const trackChanged = previousTrackIndexRef.current !== currentTrackIndex;
    const wasPlayingBeforeSwitch = previousPlayingStateRef.current;
    const shouldAutoPlay = trackChanged && wasPlayingBeforeSwitch;

    // Immediately reset progress and state when track changes
    setCurrentTime(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsStopped(true);
    setIsBuffering(true); // Show loading state immediately
    // Set duration from track metadata immediately so seek bar works
    setDuration(track.duration / 1000);

    // Update track index ref (but keep playing state ref until we know the new state)
    previousTrackIndexRef.current = currentTrackIndex;

    // Create new audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Set CORS mode for cross-origin requests
    audio.crossOrigin = 'anonymous';

    // Set volume
    audio.volume = volume / 100;

    // Event handlers
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsStopped(false);
      setIsBuffering(false);
      previousPlayingStateRef.current = true;
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsPaused(true);
      setIsStopped(false);
      setIsBuffering(false);
      previousPlayingStateRef.current = false;
    };

    const handleWaiting = () => {
      // Audio is buffering
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      // Audio is ready to play
      setIsBuffering(false);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || track.duration / 1000);
      setIsBuffering(false); // Done loading
      // Auto-play if we were supposed to
      if (shouldAutoPlay) {
        audio.play().catch((err) => {
          console.error('Error auto-playing audio:', err);
        });
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setCurrentTime(0);

      // Auto-advance to next track
      if (onTrackEnd) {
        const nextIndex =
          currentTrackIndex === tracks.length - 1 ? 0 : currentTrackIndex + 1;
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
        const errorMessages: { [key: number]: string } = {
          1: 'MEDIA_ERR_ABORTED - The user aborted the audio',
          2: 'MEDIA_ERR_NETWORK - A network error occurred',
          3: 'MEDIA_ERR_DECODE - The audio could not be decoded',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - The audio source is not supported',
        };
        const errorMsg =
          errorMessages[audio.error.code] || `Error code: ${audio.error.code}`;
        console.error(`Audio error: ${errorMsg}`, audio.error.message);

        // If it's a CORS or network error, provide helpful message
        if (audio.error.code === 2 || audio.error.code === 4) {
          console.warn(
            'This might be a CORS issue. YouTube stream URLs may not be playable directly in the browser.'
          );
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    // Load the track
    audio.load();

    // Cleanup
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('canplay', handleCanPlay);
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
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsPaused(false);
          setIsStopped(false);
        })
        .catch((err) => {
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
      isBuffering,
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
