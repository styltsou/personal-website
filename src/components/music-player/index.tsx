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

function MusicPlayerContent() {
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

export default function MusicPlayer() {
  return (
    <MusicPlayerProvider>
      <MusicPlayerContent />
    </MusicPlayerProvider>
  );
}
