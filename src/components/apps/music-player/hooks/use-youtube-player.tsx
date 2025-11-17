/**
 * Hook for managing YouTube IFrame API playback
 * Uses a hidden YouTube iframe to play tracks
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Track, AudioState } from '../types';

// YouTube IFrame API types
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadVideoById: (videoId: string) => void;
  setPlaybackQuality: (quality: string) => void;
  destroy: () => void;
}

interface YT {
  Player: new (
    elementId: string,
    config: {
      videoId: string;
      playerVars?: {
        autoplay?: number;
        controls?: number;
        disablekb?: number;
        enablejsapi?: number;
        fs?: number;
        iv_load_policy?: number;
        modestbranding?: number;
        playsinline?: number;
        rel?: number;
      };
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number; target: YTPlayer }) => void;
        onError?: (event: { data: number }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface UseYouTubePlayerReturn {
  state: AudioState;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  portalContainer: JSX.Element | null;
}

/**
 * Hook to manage YouTube IFrame API playback
 */
export function useYouTubePlayer(
  tracks: Track[],
  currentTrackIndex: number,
  onTrackEnd?: (nextIndex: number) => void
): UseYouTubePlayerReturn {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(50); // 0-100
  const [apiReady, setApiReady] = useState(false);
  const timeUpdateIntervalRef = useRef<number | null>(null);
  const previousTrackIndexRef = useRef<number>(-1);
  const isInitialLoadRef = useRef<boolean>(true);
  const seekingTimeRef = useRef<number | null>(null); // Track seek target to prevent jump-back
  const clearBufferingTimeoutRef = useRef<number | null>(null); // Timeout to clear buffering on initial load
  const tracksRef = useRef(tracks);
  const currentTrackIndexRef = useRef(currentTrackIndex);
  const volumeRef = useRef(volume);
  const onTrackEndRef = useRef(onTrackEnd);

  // Keep refs in sync
  useEffect(() => {
    tracksRef.current = tracks;
    currentTrackIndexRef.current = currentTrackIndex;
    volumeRef.current = volume;
    onTrackEndRef.current = onTrackEnd;
  }, [tracks, currentTrackIndex, volume, onTrackEnd]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      // Wait for it to load
      const checkReady = window.setInterval(() => {
        if (window.YT && window.YT.Player) {
          setApiReady(true);
          window.clearInterval(checkReady);
        }
      }, 100);
      return () => window.clearInterval(checkReady);
    }

    // Load the script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
  }, []);

  // Container will be created via portal - no direct DOM manipulation needed

  // Initialize player when API is ready and container is mounted
  useEffect(() => {
    if (!apiReady || !containerRef.current || playerRef.current) return;

    // Reset initial load flag when creating a new player instance
    // This ensures proper handling on page refresh
    isInitialLoadRef.current = true;

    // Create iframe element
    const iframeId = 'youtube-player';
    const iframe = document.createElement('div');
    iframe.id = iframeId;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);

    // Initialize player (only once)
    try {
      // Suppress postMessage errors (they're just warnings about origin mismatch)
      const originalConsoleError = console.error;
      const suppressPostMessageErrors = () => {
        console.error = (...args: unknown[]) => {
          const message = args[0]?.toString() || '';
          if (
            message.includes('postMessage') &&
            message.includes('target origin')
          ) {
            // Suppress postMessage origin warnings
            return;
          }
          originalConsoleError.apply(console, args);
        };
      };
      suppressPostMessageErrors();

      new window.YT.Player(iframeId, {
        videoId: '', // Start empty, will load video when track changes
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: event => {
            playerRef.current = event.target;
            event.target.setVolume(volumeRef.current);
            // Set to lowest quality since video is hidden anyway
            try {
              event.target.setPlaybackQuality('small');
            } catch {
              // Ignore if quality setting fails
            }
            // Load first track if available (but don't auto-play)
            const tracks = tracksRef.current;
            const currentTrackIndex = currentTrackIndexRef.current;
            if (
              tracks.length > 0 &&
              currentTrackIndex >= 0 &&
              currentTrackIndex < tracks.length
            ) {
              const track = tracks[currentTrackIndex];
              if (track.previewUrl?.startsWith('youtube:')) {
                const videoId = track.previewUrl.replace('youtube:', '');
                // Set duration from track metadata immediately so seek bar works
                setDuration(track.duration / 1000);
                setIsBuffering(true);
                // Load video but don't auto-play - user must click play
                event.target.loadVideoById(videoId);

                // Add a fallback timeout to clear buffering if state changes don't fire properly
                // This ensures buffering clears even if CUED state doesn't fire
                // Clear any existing timeout first
                if (clearBufferingTimeoutRef.current) {
                  clearTimeout(clearBufferingTimeoutRef.current);
                }
                clearBufferingTimeoutRef.current = window.setTimeout(() => {
                  if (playerRef.current && isInitialLoadRef.current) {
                    try {
                      const playerState = playerRef.current.getPlayerState();
                      const YTState = window.YT.PlayerState;
                      // If video is cued or paused, clear buffering
                      if (
                        playerState === YTState.CUED ||
                        playerState === YTState.PAUSED
                      ) {
                        setIsBuffering(false);
                        setIsPlaying(false);
                        setIsPaused(true);
                        setIsStopped(false);
                        // Ensure it's paused
                        if (playerState === YTState.CUED) {
                          playerRef.current.pauseVideo();
                        }
                        isInitialLoadRef.current = false;
                      }
                    } catch {
                      // Ignore errors
                    }
                  }
                  clearBufferingTimeoutRef.current = null;
                }, 2000); // 2 second fallback

                // Ensure it's paused after loading
                setTimeout(() => {
                  if (playerRef.current) {
                    try {
                      const playerState = playerRef.current.getPlayerState();
                      const YTState = window.YT.PlayerState;
                      // If it somehow started playing, pause it
                      if (playerState === YTState.PLAYING) {
                        playerRef.current.pauseVideo();
                      }
                    } catch {
                      // Ignore errors
                    }
                  }
                }, 200);
              }
            }
          },
          onStateChange: event => {
            const state = event.data;
            const YTState = window.YT.PlayerState;

            if (state === YTState.PLAYING) {
              // Prevent auto-play on initial load
              if (isInitialLoadRef.current) {
                // Pause immediately if this is initial load
                if (playerRef.current) {
                  try {
                    playerRef.current.pauseVideo();
                  } catch {
                    // Ignore errors
                  }
                }
                return;
              }

              setIsPlaying(true);
              setIsPaused(false);
              setIsStopped(false);
              setIsBuffering(false);

              // Clear seeking ref when playback resumes after seek
              // The actual time will now be synced from the interval
              if (seekingTimeRef.current !== null) {
                seekingTimeRef.current = null;
              }

              // Start time update interval
              if (timeUpdateIntervalRef.current) {
                window.clearInterval(timeUpdateIntervalRef.current);
              }
              timeUpdateIntervalRef.current = window.setInterval(() => {
                if (playerRef.current) {
                  try {
                    // If we're seeking, use the seek target time instead of actual time
                    // This prevents the seek bar from jumping back while buffering
                    if (seekingTimeRef.current !== null) {
                      setCurrentTime(seekingTimeRef.current);
                    } else {
                      const time = playerRef.current.getCurrentTime();
                      if (time !== undefined && !isNaN(time)) {
                        setCurrentTime(time);
                      }
                    }
                  } catch {
                    // Ignore errors
                  }
                }
              }, 250);
            } else if (state === YTState.PAUSED) {
              setIsPlaying(false);
              setIsPaused(true);
              setIsStopped(false);
              setIsBuffering(false); // Always clear buffering when paused
              // Clear seeking ref when paused (seek completed)
              if (seekingTimeRef.current !== null) {
                seekingTimeRef.current = null;
              }
              if (timeUpdateIntervalRef.current) {
                window.clearInterval(timeUpdateIntervalRef.current);
                timeUpdateIntervalRef.current = null;
              }
            } else if (state === YTState.ENDED) {
              setIsPlaying(false);
              setIsPaused(false);
              setIsStopped(true);
              setIsBuffering(false);
              setCurrentTime(0);
              if (timeUpdateIntervalRef.current) {
                window.clearInterval(timeUpdateIntervalRef.current);
                timeUpdateIntervalRef.current = null;
              }

              // Auto-advance to next track
              if (onTrackEndRef.current) {
                const tracks = tracksRef.current;
                const currentTrackIndex = currentTrackIndexRef.current;
                const nextIndex =
                  currentTrackIndex === tracks.length - 1
                    ? 0
                    : currentTrackIndex + 1;
                onTrackEndRef.current(nextIndex);
              }
            } else if (state === YTState.BUFFERING) {
              // Show buffering state
              setIsBuffering(true);
            } else if (state === YTState.UNSTARTED) {
              // Video is loading
              setIsBuffering(true);
            } else if (state === YTState.CUED) {
              // Video is loaded and ready
              if (playerRef.current) {
                try {
                  // Clear any fallback timeout since state change fired
                  if (clearBufferingTimeoutRef.current) {
                    clearTimeout(clearBufferingTimeoutRef.current);
                    clearBufferingTimeoutRef.current = null;
                  }

                  const duration = playerRef.current.getDuration();
                  if (duration && duration > 0) {
                    setDuration(duration);
                  }
                  // Set to lowest quality after video is cued
                  playerRef.current.setPlaybackQuality('small');
                  // Ensure video is paused on initial load (don't auto-play)
                  if (isInitialLoadRef.current) {
                    // Pause the video - this will trigger a PAUSED state change
                    playerRef.current.pauseVideo();
                    // Immediately clear buffering and set paused state
                    // The PAUSED state handler will also clear buffering, but we do it here too
                    setIsBuffering(false);
                    setIsPlaying(false);
                    setIsPaused(true);
                    setIsStopped(false);
                    // Mark initial load as complete
                    isInitialLoadRef.current = false;
                  } else {
                    // If not initial load, clear buffering if we're paused/stopped
                    // This handles cases like page refresh or seeking while paused
                    if (!isPlaying) {
                      setIsBuffering(false);
                    }
                  }
                } catch {
                  // Ignore errors
                }
              }
            }
          },
          onError: event => {
            console.error('YouTube player error:', event.data);
            setIsPlaying(false);
            setIsPaused(false);
            setIsStopped(true);
          },
        },
      });

      // Restore console.error after player initialization
      setTimeout(() => {
        console.error = originalConsoleError;
      }, 1000);
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }

    // Cleanup on unmount only
    return () => {
      if (timeUpdateIntervalRef.current) {
        window.clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore errors
        }
        playerRef.current = null;
      }
    };
  }, [apiReady]); // Only create player once when API is ready

  // Load video when track changes (don't recreate player)
  useEffect(() => {
    if (!playerRef.current || !apiReady) return;

    if (
      tracks.length === 0 ||
      currentTrackIndex < 0 ||
      currentTrackIndex >= tracks.length
    ) {
      return;
    }

    const track = tracks[currentTrackIndex];

    // Skip if track hasn't changed
    if (previousTrackIndexRef.current === currentTrackIndex) {
      return;
    }

    // Immediately reset progress and state when track changes
    setCurrentTime(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsStopped(true);
    setIsBuffering(true); // Show loading state immediately
    // Clear any pending seek when track changes
    seekingTimeRef.current = null;

    // Clear any running time update interval
    if (timeUpdateIntervalRef.current) {
      window.clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }

    previousTrackIndexRef.current = currentTrackIndex;
    // Reset initial load flag when user changes tracks
    if (currentTrackIndex !== -1) {
      isInitialLoadRef.current = false;
    }

    // Skip if no preview URL or not a YouTube video
    if (!track.previewUrl || !track.previewUrl.startsWith('youtube:')) {
      setIsBuffering(false);
      setDuration(track.duration / 1000);
      return;
    }

    const videoId = track.previewUrl.replace('youtube:', '');

    // Use loadVideoById instead of destroying/recreating
    try {
      playerRef.current.loadVideoById(videoId);
      // Set to lowest quality since video is hidden anyway
      try {
        playerRef.current.setPlaybackQuality('small');
      } catch {
        // Ignore if quality setting fails (might not be available yet)
      }
      // Set duration from track metadata (will be updated when video is cued)
      setDuration(track.duration / 1000);
    } catch (error) {
      console.error('Error loading video:', error);
      setIsBuffering(false);
    }
  }, [apiReady, tracks, currentTrackIndex]);

  // Update volume when it changes (separate from player initialization)
  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(volume);
      } catch {
        // Ignore errors
      }
    }
  }, [volume]);

  const play = useCallback(() => {
    if (playerRef.current) {
      // Clear initial load flag when user explicitly plays
      // This allows playback to work even on first track
      isInitialLoadRef.current = false;
      playerRef.current.playVideo();
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const stop = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stopVideo();
      setIsPlaying(false);
      setIsPaused(false);
      setIsStopped(true);
      setCurrentTime(0);
    }
  }, []);

  const seek = useCallback(
    (time: number) => {
      if (playerRef.current) {
        // Set seeking ref to prevent time update interval from overwriting
        // This keeps the seek bar at the target position while buffering
        seekingTimeRef.current = time;
        setCurrentTime(time);
        setIsBuffering(true); // Show buffering when seeking

        // Check current player state before seeking
        let wasPaused = false;
        try {
          const currentState = playerRef.current.getPlayerState();
          const YTState = window.YT.PlayerState;
          wasPaused =
            currentState === YTState.PAUSED || currentState === YTState.CUED;
        } catch {
          // If we can't check state, assume we might be paused
          wasPaused = !isPlaying;
        }

        playerRef.current.seekTo(time, true);

        // Clear buffering after a short delay if we were paused
        // This handles the case where seeking while paused doesn't trigger a state change
        if (wasPaused) {
          setTimeout(() => {
            if (playerRef.current) {
              try {
                const playerState = playerRef.current.getPlayerState();
                const YTState = window.YT.PlayerState;
                // If we're still paused or cued after seeking, clear buffering
                if (
                  playerState === YTState.PAUSED ||
                  playerState === YTState.CUED
                ) {
                  setIsBuffering(false);
                }
              } catch {
                // Ignore errors, buffering will clear on next state change
              }
            }
          }, 500);
        }
      }
    },
    [isPlaying]
  );

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore errors
        }
      }
    };
  }, []);

  // Create portal container element - hidden YouTube player container
  // Memoize to prevent unnecessary recreations
  const portalContainer = useMemo(
    () =>
      createPortal(
        <div
          id="youtube-player-container"
          ref={el => {
            if (el) {
              containerRef.current = el;
              // Apply hidden styles
              el.style.position = 'fixed';
              el.style.top = '-9999px';
              el.style.left = '-9999px';
              el.style.width = '320px';
              el.style.height = '240px';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
              el.style.visibility = 'hidden';
            }
          }}
        />,
        document.body
      ),
    [] // Only create once
  );

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
    portalContainer,
  };
}
