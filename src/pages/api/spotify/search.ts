/**
 * Spotify API Endpoint - Search
 * Search for tracks on Spotify
 */

import type { APIRoute } from 'astro';
import type { Track } from '../../../components/music-player/types';

interface SpotifyAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  preview_url: string | null;
  duration_ms: number;
}

async function getSpotifyAccessToken(): Promise<string> {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data: SpotifyAccessToken = await response.json();
  return data.access_token;
}

async function searchTracks(accessToken: string, query: string): Promise<Track[]> {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to search tracks: ${response.status}`);
  }

  const data: { tracks: { items: SpotifyTrack[] } } = await response.json();

  const tracks: Track[] = data.tracks.items
    .filter((track) => track.preview_url)
    .map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      albumArt: track.album.images[0]?.url || track.album.images[1]?.url || '',
      previewUrl: track.preview_url!,
      duration: track.duration_ms,
    }));

  return tracks;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return new Response(
        JSON.stringify({ tracks: [], error: 'Query parameter "q" is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ tracks: [], error: 'Spotify credentials not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = await getSpotifyAccessToken();
    const tracks = await searchTracks(accessToken, query);

    return new Response(
      JSON.stringify({ tracks, error: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Spotify search error:', error);
    return new Response(
      JSON.stringify({
        tracks: [],
        error: error instanceof Error ? error.message : 'Failed to search tracks',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

