/**
 * Spotify API Endpoint - Top Tracks
 * Returns user's top 10 tracks
 */

import type { APIRoute } from 'astro';
import type { Track } from '../../../components/music-player/types';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id?: string; uri?: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height?: number; width?: number }>;
  };
  preview_url: string | null;
  duration_ms: number;
  external_urls?: {
    spotify?: string;
  };
  href?: string;
  uri?: string;
}

async function getAccessToken(): Promise<string> {
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const url = 'https://accounts.spotify.com/api/token';

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  };

  const response = await fetch(url, payload);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Failed to refresh token: ${response.status} - ${JSON.stringify(data)}`
    );
  }

  return data.access_token;
}

async function getTopTracks(accessToken: string): Promise<Track[]> {
  console.log('Start fetch top tracks');

  const response = await fetch(
    'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=40',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.log('response not ok', errorText);

    throw new Error(
      `Failed to fetch top tracks: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('Invalid response format from Spotify API');
  }

  const transformedTracks = data.items.map((track: SpotifyTrack) => ({
    id: track.id,
    name: track.name,
    artist: track.artists?.[0]?.name || 'Unknown Artist',
    album: track.album?.name || 'Unknown Album',
    albumArt:
      track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || '',
    previewUrl: track.preview_url || '',
    duration: track.duration_ms,
  }));

  // Filter to ensure only one song per artist
  const seenArtists = new Set<string>();
  const uniqueTracks = transformedTracks.filter((track: Track) => {
    const artist = track.artist.toLowerCase();
    if (seenArtists.has(artist)) {
      return false;
    }
    seenArtists.add(artist);
    return true;
  });

  // Limit to maximum 10 tracks
  return uniqueTracks.slice(0, 10);
}

export const GET: APIRoute = async () => {
  try {
    const accessToken = await getAccessToken();
    const tracks = await getTopTracks(accessToken);

    return new Response(JSON.stringify({ tracks, error: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console;
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch tracks';

    return new Response(
      JSON.stringify({
        tracks: [],
        error: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
