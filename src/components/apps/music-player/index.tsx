/**
 * MusicPlayer Pro v1.0
 * Retro-styled music player component
 * Integrates with existing retro OS window system
 */

import { useEffect, useRef } from 'react';
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

// MusicPlayerContent - the actual UI component (requires provider)
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
    isBuffering,
    isPlaying,
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

  // Track vinyl rotation angle to preserve it when paused
  const vinylRef = useRef<HTMLDivElement>(null);
  const rotationAngleRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    const vinylElement = vinylRef.current;
    if (!vinylElement) return;

    if (isPlaying) {
      // Start/resume rotation animation
      const animate = (timestamp: number) => {
        if (lastTimestampRef.current === null) {
          lastTimestampRef.current = timestamp;
        }

        const deltaTime = timestamp - lastTimestampRef.current;
        lastTimestampRef.current = timestamp;

        // Update rotation angle (3 seconds per full rotation = 120 degrees per second)
        rotationAngleRef.current += (deltaTime / 1000) * 120; // degrees per second
        rotationAngleRef.current = rotationAngleRef.current % 360;

        // Apply rotation via CSS custom property
        vinylElement.style.setProperty(
          '--rotation',
          `${rotationAngleRef.current}deg`
        );

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Pause: stop animation but keep current angle
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimestampRef.current = null;
      // Keep the current rotation angle in the CSS custom property
      vinylElement.style.setProperty(
        '--rotation',
        `${rotationAngleRef.current}deg`
      );
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Main content area */}
        <div className={styles.mainContent}>
          {/* Vinyl record section - large and centered */}
          <div className={styles.albumArtSection}>
            <div className={styles.vinylContainer}>
              <a
                href={currentTrack.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${currentTrack.name} by ${currentTrack.artist} on Spotify`}
                title={`Open on Spotify: ${currentTrack.name} by ${currentTrack.artist}`}
                className={styles.vinylLink}
              >
                <div
                  ref={vinylRef}
                  className={`${styles.vinyl} ${isPlaying ? styles.spinning : ''}`}
                >
                  <div className={styles.vinylGrooves}>
                    <div className={styles.vinylGroove}></div>
                    <div className={styles.vinylGroove}></div>
                    <div className={styles.vinylGroove}></div>
                    <div className={styles.vinylGroove}></div>
                    <div className={styles.vinylGroove}></div>
                  </div>
                  <div className={styles.vinylCenter}>
                    <img
                      src={currentTrack.albumArt}
                      alt={`${currentTrack.album} album cover`}
                      className={styles.albumArt}
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'https://via.placeholder.com/400x400/7da3d1/ffffff?text=No+Image';
                      }}
                    />
                  </div>
                </div>
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

// Wrapper component that includes provider - used in app-config
// This ensures the provider only mounts when the window is rendered
export default function MusicPlayer() {
  return (
    <MusicPlayerProvider>
      <MusicPlayerContent />
    </MusicPlayerProvider>
  );
}

// Export MusicPlayerContent separately for backwards compatibility
// Note: This requires the provider to be mounted (via the default export wrapper)
export { MusicPlayerContent };
