/**
 * PlaylistPanel Component
 * Displays track list with current track highlighting
 */

import type { Track } from '../types';
import styles from './playlist-panel.module.scss';

interface PlaylistPanelProps {
  tracks: Track[];
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
  onHide?: () => void;
}

export default function PlaylistPanel({
  tracks,
  currentTrackIndex,
  onTrackSelect,
  onHide,
}: PlaylistPanelProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>Playlist</span>
        {onHide && (
          <button
            className={styles.hideButton}
            onClick={onHide}
            aria-label="Hide playlist"
            title="Hide playlist"
          >
            ×
          </button>
        )}
      </div>
      <div className={styles.trackList}>
        {tracks.map((track, index) => (
          <button
            key={track.id}
            className={`${styles.trackItem} ${
              index === currentTrackIndex ? styles.active : ''
            }`}
            onClick={() => onTrackSelect(index)}
            aria-label={`Play ${track.name} by ${track.artist}`}
          >
            <span className={styles.trackNumber}>{index + 1}.</span>
            <div className={styles.trackInfo}>
              <div className={styles.trackTitle}>{track.name}</div>
              <div className={styles.trackArtist}>{track.artist}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

