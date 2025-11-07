# GitHub Actions Workflows

## Update Tracks Workflow

This workflow automatically updates your music player tracks daily from Spotify.

### Setup Instructions

1. **Go to your GitHub repository**
   - Navigate to: Settings → Secrets and variables → Actions

2. **Add the following secrets:**
   - `SPOTIFY_CLIENT_ID` - Your Spotify app Client ID
   - `SPOTIFY_CLIENT_SECRET` - Your Spotify app Client Secret
   - `SPOTIFY_REFRESH_TOKEN` - Your Spotify refresh token

3. **How to get these values:**
   - These should be the same values you use in your `.env` file locally
   - If you don't have a refresh token, you'll need to generate one using Spotify's OAuth flow

### Workflow Schedule

- **Automatic**: Runs daily at midnight UTC (00:00)
- **Manual**: You can also trigger it manually from the Actions tab → "Update Tracks" → "Run workflow"

### What It Does

1. Fetches your top 10 tracks from Spotify (filtered to one per artist)
2. Updates `src/content/tracks/tracks.json`
3. Commits and pushes the changes
4. Vercel automatically rebuilds your site with the new tracks

### Testing Locally

You can test the script locally:

```bash
# Set environment variables
export SPOTIFY_CLIENT_ID="your_client_id"
export SPOTIFY_CLIENT_SECRET="your_client_secret"
export SPOTIFY_REFRESH_TOKEN="your_refresh_token"

# Run the script
node scripts/update-tracks.js
```

### Notes

- The workflow uses `[skip ci]` in the commit message to prevent infinite loops
- If the script fails, it writes an error state to the JSON file
- The workflow only commits if there are actual changes

