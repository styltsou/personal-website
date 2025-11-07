/**
 * VolumeControl Component
 * Volume slider with mute toggle
 */

import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import styles from './volume-control.module.scss';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function VolumeControl({
  volume,
  onVolumeChange,
}: VolumeControlProps) {
  // Remember the last volume value before muting
  const [lastVolume, setLastVolume] = useState(50);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Update the remembered volume when user manually adjusts it (if not muting)
    if (value > 0) {
      setLastVolume(value);
    }
    onVolumeChange(value);
  };

  const handleMute = () => {
    if (volume > 0) {
      // Muting: save current volume and set to 0
      setLastVolume(volume);
      onVolumeChange(0);
    } else {
      // Unmuting: restore to last saved volume
      onVolumeChange(lastVolume);
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.muteButton}
        onClick={handleMute}
        aria-label={volume > 0 ? 'Mute' : 'Unmute'}
        title={volume > 0 ? 'Mute' : 'Unmute'}
      >
        {volume > 0 ? (
          <Volume2 size={20} strokeWidth={2} />
        ) : (
          <VolumeX size={20} strokeWidth={2} />
        )}
      </button>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={volume}
        onChange={handleChange}
        className={styles.slider}
        style={{ '--progress': `${volume}%` } as React.CSSProperties}
        aria-label="Volume control"
      />
      <span className={styles.volumeLabel}>{volume}%</span>
    </div>
  );
}

