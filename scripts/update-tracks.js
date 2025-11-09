/**
 * Script to update tracks.json from Spotify API
 * This script fetches top tracks from Spotify and updates the Content Collection JSON file
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import ytSearchModule from 'yt-search';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from project root
const envPath = join(__dirname, '../.env');
config({ path: envPath });

const TRACKS_FILE_PATH = join(__dirname, '../src/content/tracks/tracks.json');

const CONFIG = {
  spotifyFetchLimit: 40,
  maxTracksPerArtist: 2,
  maxTracksToSave: 12,
  minYouTubeScore: 1500, // Minimum score to ensure quality matches
  apiTimeout: 10000, // 10 seconds timeout for API calls
  maxRetries: 3, // Maximum retry attempts for API calls
  retryDelay: 1000, // Delay between retries in ms
  youtubeSearchDelay: 1000, // Delay between YouTube searches to avoid rate limiting
};

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  console.error('Error: Missing required Spotify credentials');
  console.error(
    'Required: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN'
  );
  process.exit(1);
}

async function fetchWithTimeout(url, options, timeout = CONFIG.apiTimeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

async function retryWithBackoff(fn, maxRetries = CONFIG.maxRetries) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = CONFIG.retryDelay * attempt;
      console.warn(`⚠️  Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function validateVideoId(videoId) {
  if (!videoId || typeof videoId !== 'string') return false;
  // YouTube video IDs are 11 characters alphanumeric
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

async function getSpotifyAccessToken() {
  const url = 'https://accounts.spotify.com/api/token';

  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const response = await retryWithBackoff(async () => {
    return await fetchWithTimeout(url, {
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

async function getTopSpotifyTracks(accessToken, numTracks = 10) {
  if (!accessToken || typeof accessToken !== 'string') {
    throw new Error('Invalid access token');
  }
  if (numTracks < 1 || numTracks > 50) {
    throw new Error('numTracks must be between 1 and 50');
  }

  console.log('Fetching top tracks from Spotify...');

  const response = await retryWithBackoff(async () => {
    return await fetchWithTimeout(
      `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${numTracks}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch top tracks: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('Invalid response format from Spotify API');
  }

  // Transform tracks to match our Track interface and add Spotify URL
  return data.items.map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists?.[0]?.name || 'Unknown Artist',
    album: track.album?.name || 'Unknown Album',
    albumArt:
      track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || '',
    previewUrl: track.preview_url || '',
    duration: track.duration_ms,
    spotifyUrl: `https://open.spotify.com/track/${track.id}`,
  }));
}

function normalizeText(str) {
  return str
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function evaluateTrackNameMatch(title, trackName) {
  if (title.includes(trackName)) {
    return { match: true, score: 1000 };
  }

  const normalizedTitle = normalizeText(title);
  const normalizedTrackName = normalizeText(trackName);

  if (normalizedTitle.includes(normalizedTrackName)) {
    return { match: true, score: 950 };
  }

  const trackWords = normalizedTrackName.split(/\s+/);
  // Filter very short words (1 char), but keep 2+ char words
  // This handles cases like "I Am" where "I" is dropped but "Am" is kept
  const significantWords = trackWords.filter((w) => w.length > 1);
  if (significantWords.length === 0) {
    return { match: false, score: 0 };
  }

  const titleWords = normalizedTitle.split(/\s+/);

  // Check if words appear in order (allowing for extra words in between)
  let trackWordIndex = 0;
  let matchedInOrder = 0;

  for (const titleWord of titleWords) {
    if (trackWordIndex < significantWords.length) {
      const trackWord = significantWords[trackWordIndex];
      if (titleWord.includes(trackWord) || trackWord.includes(titleWord)) {
        matchedInOrder++;
        trackWordIndex++;
      }
    }
  }

  const matchRatio = matchedInOrder / significantWords.length;
  const minMatchRatio = significantWords.length <= 3 ? 1.0 : 0.6;

  if (matchRatio >= minMatchRatio) {
    return { match: true, score: 800 + Math.floor(matchRatio * 150) };
  }

  return { match: false, score: 0 };
}

function isArtistChannel(channel, artistNameLower) {
  // Exact match is most reliable
  if (channel === artistNameLower) return true;

  // Check if channel name contains full artist name (more reliable)
  if (channel.includes(artistNameLower)) return true;

  // Check if artist name contains channel (but be stricter - require word boundaries)
  // This prevents "Taylor" matching "Taylor Swift" incorrectly
  const channelWords = channel.split(/\s+/);
  const artistWords = artistNameLower.split(/\s+/);

  // If channel is a single word and it's part of artist name, it's likely a match
  // But if artist is a single word and channel contains it, also likely a match
  if (channelWords.length === 1 && artistWords.includes(channel)) return true;
  if (artistWords.length === 1 && channelWords.includes(artistNameLower))
    return true;

  return false;
}

function detectVideoVersionType(title, trackNameLower) {
  // Remove track name words from title to avoid false positives
  // If Spotify track is "Song (Live)", we shouldn't penalize YouTube "Song (Live)"
  const normalizedTitle = normalizeText(title.toLowerCase());
  const normalizedTrackName = normalizeText(trackNameLower);

  // Split track name into words and remove them from title
  const trackWords = normalizedTrackName
    .split(/\s+/)
    .filter((w) => w.length > 1);
  let remainingTitle = normalizedTitle;

  for (const trackWord of trackWords) {
    // Remove the word and surrounding spaces
    remainingTitle = remainingTitle
      .replace(new RegExp(`\\b${trackWord}\\b`, 'gi'), ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const liveTerms = ['live', 'concert', 'performance', 'session'];
  const acousticTerms = ['acoustic', 'unplugged'];
  const alternativeTerms = [
    'sad version',
    'stripped',
    'piano version',
    'orchestral',
    'instrumental',
    'remix',
    'extended',
    'edit',
    'alternate',
    'alternative',
    'slowed',
    'sped up',
    'reverb',
    'demo',
    'rough',
    'unreleased',
  ];

  const hasStandaloneVersion =
    remainingTitle.includes(' version') &&
    !remainingTitle.includes('music video') &&
    !remainingTitle.includes('audio') &&
    !remainingTitle.includes('official');

  return {
    isLive: liveTerms.some((term) => remainingTitle.includes(term)),
    isAcoustic: acousticTerms.some((term) => remainingTitle.includes(term)),
    isAlternative:
      alternativeTerms.some((term) => remainingTitle.includes(term)) ||
      hasStandaloneVersion,
  };
}

function calculateOfficialContentBonus(title, isArtistChannel) {
  if (
    title.includes('official music video') ||
    title.includes('officialmusicvideo')
  ) {
    return 50;
  }
  if (title.includes('official audio') || title.includes('officialaudio')) {
    return 40;
  }
  if (title.includes(' audio') && !title.includes('video')) {
    return 25;
  }
  if (title.includes('official')) {
    return isArtistChannel ? 20 : 15;
  }
  if (
    title.includes('music video') ||
    (title.includes('video') && !title.includes('audio'))
  ) {
    return 10;
  }
  return 0;
}

function calculateContentPenalty(title) {
  let penalty = 0;
  if (title.includes('lyrics')) penalty -= 50;
  if (title.includes('cover')) penalty -= 100;
  if (title.includes('visualizer') || title.includes('pseudo video'))
    penalty -= 30;
  return penalty;
}

function calculateVideoScore(video, trackNameLower, artistNameLower) {
  const title = (video.title || '').toLowerCase();
  const channel = (video.author?.name || video.author || '').toLowerCase();
  let score = 0;

  const trackNameMatch = evaluateTrackNameMatch(title, trackNameLower);
  score += trackNameMatch.match ? trackNameMatch.score : -500;

  const channelMatchesArtist = isArtistChannel(channel, artistNameLower);
  if (channelMatchesArtist) score += 800;
  if (title.includes(artistNameLower)) score += 400;

  const { isLive, isAcoustic, isAlternative } = detectVideoVersionType(
    title,
    trackNameLower
  );
  if (isLive) score += channelMatchesArtist ? -500 : -300;
  if (isAcoustic) score += channelMatchesArtist ? -400 : -250;
  if (isAlternative && !isLive && !isAcoustic) score -= 100;

  if (!isLive && !isAcoustic && !isAlternative) {
    score += calculateOfficialContentBonus(title, channelMatchesArtist);
  }

  score += calculateContentPenalty(title);
  return score;
}

async function searchYouTubeVideos(trackName, artistName) {
  if (!trackName || !artistName) {
    console.warn('⚠️  Missing track name or artist name for YouTube search');
    return [];
  }

  const ytSearch = ytSearchModule.default || ytSearchModule;
  const queries = [
    `${trackName} ${artistName} official audio`,
    `${trackName} ${artistName} audio`,
    `${trackName} ${artistName}`,
  ];

  for (const query of queries) {
    try {
      const result = await ytSearch(query);
      if (result?.videos?.length > 0) {
        return result.videos.slice(0, 10);
      }
    } catch (error) {
      console.warn(
        `⚠️  YouTube search failed for query "${query}": ${error.message}`
      );
      continue;
    }
  }
  return [];
}

function displayYouTubeResults(
  results,
  videoScoreMap,
  selectedVideoId,
  bestScore,
  scoredResults
) {
  const topAlternatives = new Set(
    scoredResults
      .slice(1)
      .filter(({ score }) => Math.abs(score - bestScore) <= 500)
      .slice(0, 3)
      .map(({ video }) => video.videoId)
      .filter(Boolean)
  );

  console.log(
    `    ${colors.cyan}YouTube search results (in order):${colors.reset}`
  );

  results.slice(0, 10).forEach((video, idx) => {
    const vidId = video.videoId;
    const score = videoScoreMap.get(vidId) || 0;
    const authorName = video.author?.name || video.author || 'Unknown';
    const isSelected = vidId === selectedVideoId;
    const isTopAlternative = topAlternatives.has(vidId);

    if (isSelected) {
      console.log(
        `    ${colors.green}${colors.bright}→ ${idx + 1}. "${video.title}" | ${authorName} [Score: ${score}] ✓ SELECTED${colors.reset}`
      );
    } else if (isTopAlternative) {
      console.log(
        `    ${colors.yellow}  ${idx + 1}. "${video.title}" | ${authorName} [Score: ${score}]${colors.reset}`
      );
    } else {
      console.log(
        `    ${colors.gray}  ${idx + 1}. "${video.title}" | ${authorName} [Score: ${score}]${colors.reset}`
      );
    }
  });
}

async function findBestYouTubeVideo(trackName, artistName) {
  try {
    const trackNameLower = trackName.toLowerCase().trim();
    const artistNameLower = artistName.toLowerCase().trim();

    const results = await searchYouTubeVideos(trackName, artistName);
    if (!results.length) return null;

    const scoredResults = results
      .map((video) => ({
        video,
        score: calculateVideoScore(video, trackNameLower, artistNameLower),
      }))
      .sort((a, b) => b.score - a.score);

    const bestMatch = scoredResults[0].video;
    const bestScore = scoredResults[0].score;
    const videoId = bestMatch.videoId;

    if (!videoId || !validateVideoId(videoId)) {
      console.warn(`    ⚠️  Invalid or missing video ID: ${videoId}`);
      return null;
    }

    const videoScoreMap = new Map(
      scoredResults.map(({ video, score }) => [video.videoId, score])
    );

    displayYouTubeResults(
      results,
      videoScoreMap,
      videoId,
      bestScore,
      scoredResults
    );
    return { videoId, score: bestScore };
  } catch (error) {
    console.warn(
      `⚠️  Error fetching YouTube preview for "${trackName}": ${error.message}`
    );
    return null;
  }
}

function preserveExistingTracks() {
  console.error('⚠️  Preserving existing tracks.json to avoid data loss');
  if (existsSync(TRACKS_FILE_PATH)) {
    try {
      const existingData = JSON.parse(readFileSync(TRACKS_FILE_PATH, 'utf8'));
      if (existingData.tracks?.length > 0) {
        console.error(
          `✓ Existing tracks.json preserved with ${existingData.tracks.length} track(s)`
        );
      }
    } catch {
      // Ignore read errors
    }
  }
}

async function enrichTracksWithYouTube(tracks) {
  console.log(
    `\n🔍 Searching YouTube for ${tracks.length} track${tracks.length > 1 ? 's' : ''}...`
  );

  const enrichedTracks = [];
  let foundCount = 0;

  for (const track of tracks) {
    console.log(
      `\n${colors.bright}${colors.blue}"${track.name}"${colors.reset} by ${colors.cyan}${track.artist}${colors.reset}`
    );

    const result = await findBestYouTubeVideo(track.name, track.artist);

    if (result?.videoId) {
      track.previewUrl = `youtube:${result.videoId}`;
      track.youtubeScore = result.score;
      foundCount++;
    } else {
      console.log(`    ✗ No YouTube video found`);
      track.youtubeScore = 0;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, CONFIG.youtubeSearchDelay)
    );
    enrichedTracks.push(track);
  }

  console.log(
    `\n✓ YouTube enrichment complete: ${foundCount} video ID${foundCount !== 1 ? 's' : ''} found out of ${tracks.length} tracks`
  );

  return enrichedTracks;
}

async function main() {
  try {
    console.log('Starting track update...');

    const accessToken = await getSpotifyAccessToken();
    console.log('✓ Successfully authenticated with Spotify');

    const tracks = await getTopSpotifyTracks(
      accessToken,
      CONFIG.spotifyFetchLimit
    );
    console.log(`✓ Fetched ${tracks.length} tracks from Spotify`);

    // Enrich with YouTube video IDs
    const enrichedTracks = await enrichTracksWithYouTube(tracks);

    // Filter by quality score
    const highQualityTracks = enrichedTracks.filter(
      (track) => (track.youtubeScore || 0) >= CONFIG.minYouTubeScore
    );

    const lowScoreCount = enrichedTracks.length - highQualityTracks.length;
    if (lowScoreCount > 0) {
      console.log(
        `✓ Filtered out ${lowScoreCount} track${lowScoreCount > 1 ? 's' : ''} with score below ${CONFIG.minYouTubeScore}`
      );
    }

    // Filter by artist limit
    const artistCounts = new Map();
    const uniqueTracks = highQualityTracks.filter((track) => {
      const artistLower = track.artist.toLowerCase();
      const count = artistCounts.get(artistLower) || 0;
      if (count >= CONFIG.maxTracksPerArtist) return false;
      artistCounts.set(artistLower, count + 1);
      return true;
    });

    const removedCount = highQualityTracks.length - uniqueTracks.length;
    if (removedCount > 0) {
      console.log(
        `✓ Filtered to ${uniqueTracks.length} tracks (removed ${removedCount} to keep max ${CONFIG.maxTracksPerArtist} per artist)`
      );
    }

    // Limit total tracks
    const tracksToSave = uniqueTracks.slice(0, CONFIG.maxTracksToSave);
    if (uniqueTracks.length > CONFIG.maxTracksToSave) {
      console.log(
        `✓ Limited to ${CONFIG.maxTracksToSave} tracks (removed ${uniqueTracks.length - CONFIG.maxTracksToSave})`
      );
    }

    writeFileSync(
      TRACKS_FILE_PATH,
      JSON.stringify({ tracks: tracksToSave, error: null }, null, 2) + '\n',
      'utf8'
    );

    console.log(`✓ Updated ${TRACKS_FILE_PATH}`);
  } catch (error) {
    console.error('Error updating tracks:', error);
    preserveExistingTracks();
    process.exit(1);
  }
}

main();
