/**
 * Hook for fetching Spotify tracks
 * Calls server-side API endpoint that securely handles Spotify authentication
 * Client never sees API credentials
 */

import { useState, useEffect, useCallback } from 'react';
import type { Track } from '../types';

interface UseSpotifyReturn {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface ApiResponse {
  tracks: Track[];
  error: string | null;
}

// Fallback mock data in case API fails
const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    albumArt:
      'https://via.placeholder.com/300x300/7da3d1/ffffff?text=Album+Art',
    previewUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 30000,
  },
  {
    id: '2',
    name: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    album: 'Led Zeppelin IV',
    albumArt:
      'https://via.placeholder.com/300x300/7da3d1/ffffff?text=Album+Art',
    previewUrl:
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 30000,
  },
];

/**
 * Hook to fetch Spotify tracks from server-side API
 * Credentials are handled server-side and never exposed to client
 */
export function useSpotify(): UseSpotifyReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTracks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/tracks');

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.tracks && data.tracks.length > 0) {
        setTracks(data.tracks);
      } else {
        console.warn('No tracks returned from API, using fallback data');
        setTracks(MOCK_TRACKS);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tracks';
      console.error('Error fetching tracks:', errorMessage);
      setError(errorMessage);
      setTracks(MOCK_TRACKS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks, refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return { tracks, loading, error, refresh };
}

