/**
 * Script to update tracks.json from Spotify API
 * This script fetches top tracks from Spotify and updates the Content Collection JSON file
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TRACKS_FILE_PATH = join(__dirname, '../src/content/tracks/tracks.json');

// Get environment variables
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  console.error('Error: Missing required Spotify credentials');
  console.error('Required: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN');
  process.exit(1);
}

/**
 * Get Spotify access token using refresh token
 */
async function getAccessToken() {
  const url = 'https://accounts.spotify.com/api/token';

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
      client_id: SPOTIFY_CLIENT_ID,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to refresh token: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch top tracks from Spotify
 */
async function getTopTracks(accessToken) {
  console.log('Fetching top tracks from Spotify...');

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
    throw new Error(`Failed to fetch top tracks: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('Invalid response format from Spotify API');
  }

  // Transform tracks to match our Track interface
  const transformedTracks = data.items.map((track) => ({
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
  const seenArtists = new Set();
  const uniqueTracks = transformedTracks.filter((track) => {
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

/**
 * Main function
 */
async function main() {
  try {
    console.log('Starting track update...');

    // Get access token
    const accessToken = await getAccessToken();
    console.log('✓ Successfully authenticated with Spotify');

    // Fetch top tracks
    const tracks = await getTopTracks(accessToken);
    console.log(`✓ Fetched ${tracks.length} tracks from Spotify`);

    // Create the data structure matching our Content Collection schema
    const tracksData = {
      tracks,
      error: null,
    };

    // Write to file
    writeFileSync(TRACKS_FILE_PATH, JSON.stringify(tracksData, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated ${TRACKS_FILE_PATH}`);

    console.log('✓ Track update completed successfully!');
  } catch (error) {
    console.error('Error updating tracks:', error);

    // Write error state to file (so the app knows there was an error)
    const errorData = {
      tracks: [],
      error: error instanceof Error ? error.message : 'Failed to fetch tracks',
    };

    writeFileSync(TRACKS_FILE_PATH, JSON.stringify(errorData, null, 2) + '\n', 'utf8');
    console.error('✓ Wrote error state to tracks.json');

    process.exit(1);
  }
}

main();

