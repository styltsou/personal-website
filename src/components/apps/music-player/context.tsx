/**
 * Music Player Context
 * Provides all player state and actions to child components
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';

import { useStore } from '@/store';
import type { Track } from './types';
import { useAudioPlayer } from './hooks/use-audio-player';
import { useYouTubePlayer } from './hooks/use-youtube-player';
import tracksData from '@/content/tracks/tracks.json';

type LoopMode = 'none' | 'playlist' | 'song';

interface MusicPlayerContextValue {
  // Track data
  tracks: Track[];
  loading: boolean;
  error: string | null;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  currentTrack: Track | null;

  // Audio state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isBuffering: boolean;

  // Actions
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  next: () => void;
  previous: () => void;

  // Loop
  loopMode: LoopMode;
  toggleLoop: () => void;

  // Shuffle
  isShuffled: boolean;
  toggleShuffle: () => void;

  // Playlist
  playlistVisible: boolean;
  setPlaylistVisible: (visible: boolean) => void;
  handleTrackSelect: (index: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
}

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export function MusicPlayerProvider({ children }: MusicPlayerProviderProps) {
  // Read-only access to window state to check if music player window exists
  const windows = useStore((state) => state.windows);
  const musicPlayerWindowExists = windows.some(
    (window) => window.id === 'music-player'
  );

  // Get tracks from Content Collection (imported as static JSON)
  const tracks: Track[] = tracksData.tracks || [];
  const loading = false; // No loading needed for static data
  const error: string | null = tracksData.error || null;

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlistVisible, setPlaylistVisible] = useState(true);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  const playRef = useRef<(() => void) | null>(null);
  const seekRef = useRef<((time: number) => void) | null>(null);
  const activePlayerRef = useRef<{
    play: () => void;
    pause: () => void;
    state: { isPlaying: boolean };
  } | null>(null);
  const previousWindowExistsRef = useRef<boolean | null>(null);

  // Shuffle array helper
  const shuffleArray = useCallback((array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Initialize shuffled indices when shuffle is enabled
  useEffect(() => {
    if (isShuffled && tracks.length > 0 && shuffledIndices.length === 0) {
      const indices = Array.from({ length: tracks.length }, (_, i) => i);
      const shuffled = shuffleArray(indices);
      // Ensure current track is first in shuffle
      const currentIdx = shuffled.indexOf(currentTrackIndex);
      if (currentIdx > 0) {
        [shuffled[0], shuffled[currentIdx]] = [
          shuffled[currentIdx],
          shuffled[0],
        ];
      }
      setShuffledIndices(shuffled);
    } else if (!isShuffled) {
      setShuffledIndices([]);
    }
  }, [isShuffled, tracks.length, shuffleArray, currentTrackIndex]);

  const handleTrackEnd = useCallback(
    (newIndex: number) => {
      if (loopMode === 'song') {
        // Loop the same song
        if (seekRef.current) {
          seekRef.current(0);
        }
        setTimeout(() => {
          if (playRef.current) {
            playRef.current();
          }
        }, 200);
      } else if (loopMode === 'playlist') {
        // Loop playlist - always advance (will loop back to start)
        // If shuffle is enabled, use shuffled order
        if (isShuffled && shuffledIndices.length > 0) {
          const currentShuffleIdx = shuffledIndices.indexOf(currentTrackIndex);
          if (currentShuffleIdx !== -1) {
            const nextShuffleIdx =
              (currentShuffleIdx + 1) % shuffledIndices.length;
            const nextTrackIdx = shuffledIndices[nextShuffleIdx];
            setCurrentTrackIndex(nextTrackIdx);
            if (playRef.current) {
              setTimeout(() => {
                playRef.current?.();
              }, 200);
            }
            return;
          }
        }
        // Normal playlist loop
        setCurrentTrackIndex(newIndex);
        if (playRef.current) {
          setTimeout(() => {
            playRef.current?.();
          }, 200);
        }
      } else {
        // 'none' mode - advance to next track (but don't loop at end)
        // If shuffle is enabled, use shuffled order
        if (isShuffled && shuffledIndices.length > 0) {
          const currentShuffleIdx = shuffledIndices.indexOf(currentTrackIndex);
          if (currentShuffleIdx !== -1) {
            const nextShuffleIdx = currentShuffleIdx + 1;
            if (nextShuffleIdx < shuffledIndices.length) {
              const nextTrackIdx = shuffledIndices[nextShuffleIdx];
              setCurrentTrackIndex(nextTrackIdx);
              if (playRef.current) {
                setTimeout(() => {
                  playRef.current?.();
                }, 200);
              }
            }
            // If at end, just stop (don't loop)
            return;
          }
        }
        // Normal advance - only if not at end
        if (newIndex > currentTrackIndex) {
          setCurrentTrackIndex(newIndex);
          if (playRef.current) {
            setTimeout(() => {
              playRef.current?.();
            }, 200);
          }
        }
        // If at end, just stop (don't loop)
      }
    },
    [loopMode, isShuffled, shuffledIndices, currentTrackIndex]
  );

  // Determine which player to use based on current track
  const validTrackIndex = Math.max(
    0,
    Math.min(currentTrackIndex, tracks.length - 1)
  );
  const currentTrack = tracks[validTrackIndex] || tracks[0] || null;
  const isYouTubeTrack =
    currentTrack?.previewUrl?.startsWith('youtube:') || false;

  // Use YouTube player for YouTube tracks, HTML5 audio for others
  const youtubePlayer = useYouTubePlayer(
    tracks,
    currentTrackIndex,
    isYouTubeTrack ? handleTrackEnd : undefined
  );
  const audioPlayer = useAudioPlayer(
    tracks,
    currentTrackIndex,
    !isYouTubeTrack ? handleTrackEnd : undefined
  );

  // Select the active player based on track type
  const activePlayer = isYouTubeTrack ? youtubePlayer : audioPlayer;

  // Get portal container from YouTube player (only when using YouTube)
  const youtubePortalContainer = isYouTubeTrack
    ? youtubePlayer.portalContainer
    : null;

  useEffect(() => {
    playRef.current = activePlayer.play;
    seekRef.current = activePlayer.seek;
    activePlayerRef.current = activePlayer;
  }, [activePlayer]);

  // Handle window lifecycle: pause when window closes
  useEffect(() => {
    // Initialize ref on first render
    if (previousWindowExistsRef.current === null) {
      previousWindowExistsRef.current = musicPlayerWindowExists;
      return;
    }

    // If window was open and now it's closed, pause playback
    if (
      previousWindowExistsRef.current &&
      !musicPlayerWindowExists &&
      activePlayerRef.current?.state.isPlaying
    ) {
      activePlayerRef.current.pause();
    }

    previousWindowExistsRef.current = musicPlayerWindowExists;
  }, [musicPlayerWindowExists]);

  const handleTrackSelect = useCallback((index: number) => {
    setCurrentTrackIndex(index);

    // Auto-play when user explicitly selects a track
    // Wait a bit for the player to load the new track, then play
    setTimeout(() => {
      if (playRef.current) {
        playRef.current();
      }
    }, 300);
  }, []);

  const toggleLoop = useCallback(() => {
    setLoopMode((prev) => {
      if (prev === 'none') return 'playlist';
      if (prev === 'playlist') return 'song';
      return 'none';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
    // Reset shuffled indices when toggling off
    if (isShuffled) {
      setShuffledIndices([]);
    }
  }, [isShuffled]);

  const getNextIndex = useCallback(() => {
    const validTrackIndex = Math.max(
      0,
      Math.min(currentTrackIndex, tracks.length - 1)
    );

    if (isShuffled && shuffledIndices.length > 0) {
      const currentShuffleIdx = shuffledIndices.indexOf(validTrackIndex);
      if (currentShuffleIdx !== -1) {
        const nextShuffleIdx = (currentShuffleIdx + 1) % shuffledIndices.length;
        return shuffledIndices[nextShuffleIdx];
      }
    }

    // Always allow looping when clicking next button (regardless of loop mode)
    // Loop mode only affects auto-advance when track ends
    return validTrackIndex === tracks.length - 1 ? 0 : validTrackIndex + 1;
  }, [isShuffled, shuffledIndices, currentTrackIndex, tracks.length]);

  const getPreviousIndex = useCallback(() => {
    const validTrackIndex = Math.max(
      0,
      Math.min(currentTrackIndex, tracks.length - 1)
    );

    if (isShuffled && shuffledIndices.length > 0) {
      const currentShuffleIdx = shuffledIndices.indexOf(validTrackIndex);
      if (currentShuffleIdx !== -1) {
        const prevShuffleIdx =
          currentShuffleIdx === 0
            ? shuffledIndices.length - 1
            : currentShuffleIdx - 1;
        return shuffledIndices[prevShuffleIdx];
      }
    }

    // Always allow looping when clicking previous button (regardless of loop mode)
    // Loop mode only affects auto-advance when track ends
    return validTrackIndex === 0 ? tracks.length - 1 : validTrackIndex - 1;
  }, [isShuffled, shuffledIndices, currentTrackIndex, tracks.length]);

  const next = useCallback(() => {
    const newIndex = getNextIndex();
    setCurrentTrackIndex(newIndex);
    setTimeout(() => {
      activePlayer.seek(0);
      activePlayer.play();
    }, 100);
  }, [getNextIndex, activePlayer]);

  const previous = useCallback(() => {
    const newIndex = getPreviousIndex();
    setCurrentTrackIndex(newIndex);
    setTimeout(() => {
      activePlayer.seek(0);
      activePlayer.play();
    }, 100);
  }, [getPreviousIndex, activePlayer]);

  const isBufferingValue = activePlayer.state.isBuffering;

  // Debug: log buffering state
  useEffect(() => {
    if (isBufferingValue) {
      console.log(
        'Context: isBuffering = true, activePlayer:',
        activePlayer.state
      );
    }
  }, [isBufferingValue, activePlayer]);

  const value: MusicPlayerContextValue = {
    tracks,
    loading,
    error,
    currentTrackIndex,
    setCurrentTrackIndex,
    currentTrack,
    isPlaying: activePlayer.state.isPlaying,
    currentTime: activePlayer.state.currentTime,
    duration: activePlayer.state.duration,
    volume: activePlayer.state.volume,
    isBuffering: isBufferingValue,
    play: activePlayer.play,
    pause: activePlayer.pause,
    seek: activePlayer.seek,
    setVolume: activePlayer.setVolume,
    next,
    previous,
    loopMode,
    toggleLoop,
    isShuffled,
    toggleShuffle,
    playlistVisible,
    setPlaylistVisible,
    handleTrackSelect,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {/* Render YouTube player portal container */}
      {youtubePortalContainer}
    </MusicPlayerContext.Provider>
  );
}
