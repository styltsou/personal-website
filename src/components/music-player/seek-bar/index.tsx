/**
 * SeekBar Component
 * Progress bar with time display and seek functionality
 */

import styles from './seek-bar.module.scss';

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function SeekBar({ currentTime, duration, onSeek }: SeekBarProps) {
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onSeek(value);
  };

  return (
    <div className={styles.container}>
      <span className={styles.time}>{formatTime(currentTime)}</span>
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={currentTime}
        onChange={handleChange}
        className={styles.slider}
        style={{ '--progress': `${percentage}%` } as React.CSSProperties}
        aria-label="Seek through track"
      />
      <span className={styles.time}>{formatTime(duration)}</span>
    </div>
  );
}

