# GitHub Actions Workflows

## Update Tracks Workflow

This workflow automatically updates your music player tracks daily from Spotify.

### Setup Instructions

1. **Go to your GitHub repository**
   - Navigate to: Settings → Secrets and variables → Actions

2. **Add the following secrets:**
   - `SPOTIFY_CLIENT_ID` - Your Spotify app Client ID (required)
   - `SPOTIFY_CLIENT_SECRET` - Your Spotify app Client Secret (required)
   - `SPOTIFY_REFRESH_TOKEN` - Your Spotify refresh token (required)

3. **How to get these values:**
   - These should be the same values you use in your `.env` file locally
   - If you don't have a refresh token, you'll need to generate one using Spotify's OAuth flow

### Workflow Schedule

- **Automatic**: Runs daily at midnight UTC (00:00)
- **Manual**: You can also trigger it manually from the Actions tab → "Update Tracks" → "Run workflow"

### What It Does

1. Fetches your top tracks from Spotify
2. Searches YouTube for stream URLs where Spotify previews are missing (using `play-dl` package)
3. Updates `src/content/tracks/tracks.json`
4. Commits and pushes the changes
5. Vercel automatically rebuilds your site with the new tracks

**Note**: Using YouTube streams may violate YouTube's Terms of Service. The script uses `play-dl` to get stream URLs for playback only (not downloading files). Use at your own risk.

### Testing Locally

You can test the script locally:

```bash
# Install dependencies first (includes play-dl for YouTube)
npm install

# Set environment variables (or use .env file)
export SPOTIFY_CLIENT_ID="your_client_id"
export SPOTIFY_CLIENT_SECRET="your_client_secret"
export SPOTIFY_REFRESH_TOKEN="your_refresh_token"

# Run the script
npm run update-tracks
# or
node scripts/update-tracks.js
```

**Note**: The script requires `play-dl` package for YouTube support. Install it with `npm install play-dl` if not already installed.

### Notes

- The workflow uses `[skip ci]` in the commit message to prevent infinite loops
- If the script fails, it writes an error state to the JSON file
- The workflow only commits if there are actual changes
