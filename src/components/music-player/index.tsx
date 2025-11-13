/**
 * MusicPlayer Pro v1.0
 * Retro-styled music player component
 * Integrates with existing retro OS window system
 */

import { MusicPlayerProvider, useMusicPlayer } from './context';
import ControlPanel from './control-panel';
import PlaylistPanel from './playlist-panel';
import SeekBar from './seek-bar';
import VolumeControl from './volume-control';
import styles from './styles.module.scss';

// Re-export MusicPlayerProvider and useMusicPlayer so they can be imported from this module
export { MusicPlayerProvider, useMusicPlayer } from './context';

// Export icon so it can be imported from the same place as the component
export { MusicPlayerIcon } from './icon';

// Export MusicPlayerContent separately so it can be used without the provider
// This allows the provider to stay mounted at Desktop level while UI is conditionally rendered
export function MusicPlayerContent() {
  const {
    tracks,
    loading,
    error,
    currentTrack,
    currentTime,
    duration,
    volume,
    seek,
    setVolume,
    playlistVisible,
    setPlaylistVisible,
    handleTrackSelect,
    currentTrackIndex,
    isBuffering,
  } = useMusicPlayer();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>Loading tracks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>Error loading tracks: {error}</div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>No tracks available</div>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>No track available</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Main content area */}
        <div className={styles.mainContent}>
          {/* Album art section - large and centered */}
          <div className={styles.albumArtSection}>
            <div className={styles.albumArtContainer}>
              <a
                href={currentTrack.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${currentTrack.name} by ${currentTrack.artist} on Spotify`}
                title={`Open on Spotify: ${currentTrack.name} by ${currentTrack.artist}`}
              >
                <img
                  src={currentTrack.albumArt}
                  alt={`${currentTrack.album} album cover`}
                  className={styles.albumArt}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'https://via.placeholder.com/400x400/7da3d1/ffffff?text=No+Image';
                  }}
                />
              </a>
            </div>
          </div>

          {/* Track info section - centered below art */}
          <div className={styles.trackInfoSection}>
            <div className={styles.trackTitle}>{currentTrack.name}</div>
            <div className={styles.trackArtist}>{currentTrack.artist}</div>
            <div className={styles.trackAlbum}>{currentTrack.album}</div>
          </div>

          {/* Bottom controls section - all controls at bottom */}
          <div className={styles.bottomControls}>
            {/* Controls section */}
            <div className={styles.controlsSection}>
              <ControlPanel />
            </div>

            {/* Seek bar section */}
            <div className={styles.seekBarSection}>
              <SeekBar
                currentTime={currentTime}
                duration={duration}
                onSeek={seek}
                isBuffering={isBuffering}
              />
            </div>

            {/* Volume section */}
            <div className={styles.volumeSection}>
              <VolumeControl volume={volume} onVolumeChange={setVolume} />
            </div>
          </div>
        </div>

        {/* Playlist sidebar */}
        {playlistVisible && (
          <div className={styles.playlistSection}>
            <PlaylistPanel
              tracks={tracks}
              currentTrackIndex={currentTrackIndex}
              onTrackSelect={handleTrackSelect}
              onHide={() => setPlaylistVisible(false)}
            />
          </div>
        )}

        {!playlistVisible && (
          <div className={styles.playlistToggleContainer}>
            <button
              className={styles.playlistToggle}
              onClick={() => setPlaylistVisible(true)}
            >
              Show Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Default export includes provider (for backwards compatibility)
export default function MusicPlayer() {
  return (
    <MusicPlayerProvider>
      <MusicPlayerContent />
    </MusicPlayerProvider>
  );
}
