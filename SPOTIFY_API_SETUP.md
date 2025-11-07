# Spotify API Setup Guide

This guide explains how to get Spotify API credentials and integrate them with the MusicPlayer Pro component.

## 📋 Required Credentials

You need **two credentials** from Spotify:

1. **Client ID** - Public identifier for your app
2. **Client Secret** - Private key for your app (keep this secret!)

## 🔑 Step 1: Get Spotify API Credentials

### 1.1 Create a Spotify Developer Account

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (or create one if you don't have one)
3. Click **"Create App"** button

### 1.2 Create Your App

Fill out the form:
- **App Name**: `MusicPlayer Pro` (or any name you prefer)
- **App Description**: `Music player component for personal website`
- **Redirect URI**: `http://localhost:4321` (for local development)
  - For production, you'll need to add your actual domain
- **Website**: Your website URL (optional)
- Accept the terms and click **"Save"**

### 1.3 Get Your Credentials

After creating the app, you'll see:
- **Client ID** - Copy this (it's a long string like `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
- **Client Secret** - Click **"View client secret"** and copy it (it's also a long string)

**⚠️ Important**: Keep your Client Secret private! Never commit it to Git.

## 🔧 Step 2: Set Up Environment Variables

### 2.1 Create `.env` File

In your project root directory (`/home/styltsou/Documents/code/personal-website/`), create a file named `.env`:

```bash
# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

# Optional: Spotify Playlist ID (if you want to fetch a specific playlist)
# SPOTIFY_PLAYLIST_ID=your_playlist_id_here
```

**Replace** `your_client_id_here` and `your_client_secret_here` with your actual credentials.

### 2.2 Verify `.env` is in `.gitignore`

The `.env` file should already be in your `.gitignore` (which it is), so your secrets won't be committed to Git.

## 📝 Step 3: How the Code Will Use These Credentials

The credentials will be used in `src/hooks/use-spotify.ts` to:

1. **Authenticate** with Spotify API using Client Credentials flow
2. **Fetch tracks** from a playlist or search for tracks
3. **Get track preview URLs** for playback

### Example API Call Flow:

```
1. Get access token using Client ID + Secret
2. Use access token to fetch playlist tracks
3. Extract preview URLs from track data
4. Display tracks in the player
```

## 🎵 Step 4: Choose Your Data Source

You have two options for what tracks to fetch:

### Option A: Fetch from a Public Playlist

1. Go to Spotify and find a public playlist
2. Right-click the playlist → **"Share"** → **"Copy link to playlist"**
3. The URL will look like: `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`
4. Extract the playlist ID (the part after `/playlist/`): `37i9dQZF1DXcBWIGoYBM5M`
5. Add it to your `.env` file:
   ```
   SPOTIFY_PLAYLIST_ID=37i9dQZF1DXcBWIGoYBM5M
   ```

### Option B: Use Search API

The code can search for tracks by keyword instead of using a playlist.

## 📍 Where to Find Credentials Later

If you need to find your credentials again:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app name
3. You'll see your **Client ID** on the app page
4. Click **"View client secret"** to reveal your **Client Secret**

## 🔒 Security Notes

- ✅ `.env` is already in `.gitignore` (your secrets are safe)
- ✅ Never commit `.env` to version control
- ✅ Use different credentials for development and production
- ✅ For production, set environment variables in your hosting platform (Vercel, Netlify, etc.)

## 🚀 Next Steps

Once you have your credentials set up in `.env`, I can help you:

1. Update `use-spotify.ts` to use the real API
2. Implement authentication with Spotify
3. Fetch tracks from a playlist or search
4. Handle errors and edge cases

Just provide me with:
- Your Client ID
- Your Client Secret (I'll help you add it to `.env` securely)
- Your preferred playlist ID (optional)

Or I can set up the code to use these environment variables, and you can add the actual values yourself!

