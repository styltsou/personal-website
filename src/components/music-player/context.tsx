/**
 * Music Player Context
 * Provides all player state and actions to child components
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useAudioPlayer } from './hooks/use-audio-player';
import type { Track } from './types';
import tracksData from '../../content/tracks/tracks.json';

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
        [shuffled[0], shuffled[currentIdx]] = [shuffled[currentIdx], shuffled[0]];
      }
      setShuffledIndices(shuffled);
    } else if (!isShuffled) {
      setShuffledIndices([]);
    }
  }, [isShuffled, tracks.length, shuffleArray, currentTrackIndex]);

  const handleTrackEnd = useCallback(
    (newIndex: number) => {
      if (loopMode === 'song') {
        if (seekRef.current) {
          seekRef.current(0);
        }
        setTimeout(() => {
          if (playRef.current) {
            playRef.current();
          }
        }, 200);
      } else if (loopMode === 'playlist') {
        // If shuffle is enabled, use shuffled order
        if (isShuffled && shuffledIndices.length > 0) {
          const currentShuffleIdx = shuffledIndices.indexOf(currentTrackIndex);
          if (currentShuffleIdx !== -1) {
            const nextShuffleIdx = (currentShuffleIdx + 1) % shuffledIndices.length;
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
      }
      // If loopMode is 'none', track just ends (no auto-advance)
    },
    [loopMode, isShuffled, shuffledIndices, currentTrackIndex]
  );

  const audioPlayer = useAudioPlayer(tracks, currentTrackIndex, handleTrackEnd);

  useEffect(() => {
    playRef.current = audioPlayer.play;
    seekRef.current = audioPlayer.seek;
  }, [audioPlayer.play, audioPlayer.seek]);

  const handleTrackSelect = useCallback((index: number) => {
    const wasPlaying = audioPlayer.state.isPlaying;
    setCurrentTrackIndex(index);
    if (audioPlayer.state.isPlaying || audioPlayer.state.isPaused) {
      audioPlayer.seek(0);
    }
    if (wasPlaying) {
      setTimeout(() => {
        audioPlayer.play();
      }, 100);
    }
  }, [audioPlayer]);

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
    const validTrackIndex = Math.max(0, Math.min(currentTrackIndex, tracks.length - 1));
    
    if (isShuffled && shuffledIndices.length > 0) {
      const currentShuffleIdx = shuffledIndices.indexOf(validTrackIndex);
      if (currentShuffleIdx !== -1) {
        const nextShuffleIdx = (currentShuffleIdx + 1) % shuffledIndices.length;
        return shuffledIndices[nextShuffleIdx];
      }
    }
    
    if (loopMode === 'playlist') {
      return validTrackIndex === tracks.length - 1 ? 0 : validTrackIndex + 1;
    } else if (loopMode === 'none') {
      // Don't advance past the last track
      return Math.min(validTrackIndex + 1, tracks.length - 1);
    }
    // For 'song' mode, next doesn't make sense, but return current
    return validTrackIndex;
  }, [loopMode, isShuffled, shuffledIndices, currentTrackIndex, tracks.length]);

  const getPreviousIndex = useCallback(() => {
    const validTrackIndex = Math.max(0, Math.min(currentTrackIndex, tracks.length - 1));
    
    if (isShuffled && shuffledIndices.length > 0) {
      const currentShuffleIdx = shuffledIndices.indexOf(validTrackIndex);
      if (currentShuffleIdx !== -1) {
        const prevShuffleIdx = currentShuffleIdx === 0 ? shuffledIndices.length - 1 : currentShuffleIdx - 1;
        return shuffledIndices[prevShuffleIdx];
      }
    }
    
    if (loopMode === 'playlist') {
      return validTrackIndex === 0 ? tracks.length - 1 : validTrackIndex - 1;
    } else if (loopMode === 'none') {
      // Don't go before the first track
      return Math.max(validTrackIndex - 1, 0);
    }
    // For 'song' mode, previous doesn't make sense, but return current
    return validTrackIndex;
  }, [loopMode, isShuffled, shuffledIndices, currentTrackIndex, tracks.length]);

  const next = useCallback(() => {
    const newIndex = getNextIndex();
    setCurrentTrackIndex(newIndex);
    setTimeout(() => {
      audioPlayer.seek(0);
      audioPlayer.play();
    }, 100);
  }, [getNextIndex, audioPlayer]);

  const previous = useCallback(() => {
    const newIndex = getPreviousIndex();
    setCurrentTrackIndex(newIndex);
    setTimeout(() => {
      audioPlayer.seek(0);
      audioPlayer.play();
    }, 100);
  }, [getPreviousIndex, audioPlayer]);

  const validTrackIndex = Math.max(0, Math.min(currentTrackIndex, tracks.length - 1));
  const currentTrack = tracks[validTrackIndex] || tracks[0] || null;

  const value: MusicPlayerContextValue = {
    tracks,
    loading,
    error,
    currentTrackIndex,
    setCurrentTrackIndex,
    currentTrack,
    isPlaying: audioPlayer.state.isPlaying,
    currentTime: audioPlayer.state.currentTime,
    duration: audioPlayer.state.duration,
    volume: audioPlayer.state.volume,
    play: audioPlayer.play,
    pause: audioPlayer.pause,
    seek: audioPlayer.seek,
    setVolume: audioPlayer.setVolume,
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
    </MusicPlayerContext.Provider>
  );
}

