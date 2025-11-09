# Spotify API Integration - Complete ✅

## What Was Set Up

### 1. **Server-Side API Endpoint** (`src/pages/api/spotify/tracks.ts`)

- ✅ Secure server-side endpoint that handles Spotify authentication
- ✅ Client credentials are **NEVER** exposed to the browser
- ✅ Supports fetching tracks from a playlist or searching for tracks
- ✅ Automatically uses default playlist from `.env` if no parameters provided

### 2. **Updated Client Hook** (`src/hooks/use-spotify.ts`)

- ✅ Calls the secure API endpoint instead of making direct Spotify API calls
- ✅ Handles errors gracefully with fallback to mock data
- ✅ Supports optional playlist ID or search query parameters

### 3. **Astro Configuration** (`astro.config.mjs`)

- ✅ Changed `output: 'static'` to `output: 'server'` to enable API endpoints
- ✅ Fixed compress configuration options

## Security ✅

**Your credentials are secure:**

- ✅ Client ID and Secret are only accessed server-side via `import.meta.env`
- ✅ Credentials are never sent to the browser
- ✅ All Spotify API calls happen on the server
- ✅ Client only receives track data (no credentials)

## How It Works

```
Client (Browser)              Server (Astro API)           Spotify API
     |                              |                           |
     |-- GET /api/spotify/tracks -->|                           |
     |                              |-- Authenticate with     -->|
     |                              |   Client ID + Secret       |
     |                              |                           |
     |                              |<-- Access Token ----------|
     |                              |                           |
     |                              |-- Fetch Tracks with      -->|
     |                              |   Access Token             |
     |                              |                           |
     |<-- Track Data (JSON) --------|-- Track Data ------------|
```

## Environment Variables

Make sure your `.env` file has:

```bash
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# Optional: Default playlist ID
SPOTIFY_PLAYLIST_ID=your_playlist_id_here
```

## API Endpoint Usage

The API endpoint supports these query parameters:

- `playlistId` - Fetch tracks from a specific playlist
- `search` - Search for tracks by keyword

### Examples:

```
# Use default playlist (from .env)
GET /api/spotify/tracks

# Fetch specific playlist
GET /api/spotify/tracks?playlistId=37i9dQZF1DXcBWIGoYBM5M

# Search for tracks
GET /api/spotify/tracks?search=rock%20music
```

## Testing

1. Start the dev server: `pnpm dev`
2. Open the music player component
3. It should automatically fetch tracks from your Spotify playlist
4. Check the browser console for any errors

## Deployment Notes

Since we're using `output: 'server'`, you'll need an adapter for deployment:

### For Vercel:

```bash
pnpm add @astrojs/vercel
```

Then update `astro.config.mjs`:

```js
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // ... rest of config
});
```

### For Netlify:

```bash
pnpm add @astrojs/netlify
```

Then update `astro.config.mjs`:

```js
import netlify from '@astrojs/netlify/functions';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  // ... rest of config
});
```

### For Node.js:

```bash
pnpm add @astrojs/node
```

Then update `astro.config.mjs`:

```js
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  // ... rest of config
});
```

## Troubleshooting

### Error: "Spotify credentials not configured"

- Check that `.env` file exists and has `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- Restart the dev server after adding environment variables

### Error: "Failed to get access token"

- Verify your Client ID and Secret are correct
- Check that your Spotify app is active in the Spotify Developer Dashboard

### No tracks returned

- Check that your playlist is public
- Verify the playlist ID is correct
- Some tracks don't have preview URLs and will be skipped

### API endpoint not found

- Make sure `output: 'server'` is set in `astro.config.mjs`
- Restart the dev server

## Next Steps

The integration is complete! The music player will now:

1. ✅ Fetch real tracks from Spotify
2. ✅ Display album art, artist names, track titles
3. ✅ Play 30-second previews
4. ✅ Keep all credentials secure on the server

You can now customize:

- Which playlist to use by default
- Add search functionality
- Add more features as needed
