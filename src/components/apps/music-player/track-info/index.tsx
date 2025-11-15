/**
 * TrackInfo Component
 * Displays album art, track title, artist, album, and time
 */

import type { Track, AudioState } from '../types';
import styles from './track-info.module.scss';

interface TrackInfoProps {
  track: Track;
  audioState: AudioState;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function TrackInfo({ track, audioState }: TrackInfoProps) {
  return (
    <div className={styles.container}>
      <div className={styles.albumArtContainer}>
        <img
          src={track.albumArt}
          alt={`${track.album} album cover`}
          className={styles.albumArt}
          onError={(e) => {
            // Fallback to placeholder on error
            const target = e.target as HTMLImageElement;
            target.src =
              'https://via.placeholder.com/64x64/7da3d1/ffffff?text=No+Image';
          }}
        />
      </div>
      <div className={styles.info}>
        <div className={styles.title}>{track.name}</div>
        <div className={styles.artist}>{track.artist}</div>
        <div className={styles.album}>{track.album}</div>
        <div className={styles.time}>
          {formatTime(audioState.currentTime)} /{' '}
          {formatTime(audioState.duration)}
        </div>
      </div>
    </div>
  );
}
