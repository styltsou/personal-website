/**
 * SeekBar Component
 * Progress bar with time display and seek functionality
 */

import styles from './seek-bar.module.scss';

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isBuffering?: boolean;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function SeekBar({
  currentTime,
  duration,
  onSeek,
  isBuffering = false,
}: SeekBarProps) {
  // Ensure duration is at least 1 to make slider functional
  const safeDuration = duration > 0 ? duration : 1;
  const percentage = safeDuration > 0 ? (currentTime / safeDuration) * 100 : 0;
  const safeCurrentTime = Math.min(currentTime, safeDuration);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    // Only seek if duration is valid
    if (duration > 0) {
      onSeek(value);
    }
  };

  // Debug: log buffering state
  if (isBuffering) {
    console.log('SeekBar: isBuffering = true');
  }

  return (
    <div className={styles.container}>
      <span className={styles.time}>{formatTime(currentTime)}</span>
      <div className={`${styles.sliderWrapper} ${isBuffering ? styles.buffering : ''}`}>
        <input
          type="range"
          min="0"
          max={safeDuration}
          step="0.1"
          value={safeCurrentTime}
          onChange={handleChange}
          className={`${styles.slider} ${isBuffering ? styles.buffering : ''}`}
          style={{ '--progress': `${percentage}%` } as React.CSSProperties}
          aria-label="Seek through track"
          disabled={duration <= 0}
        />
        {isBuffering && (
          <div 
            className={styles.stripesOverlay}
            style={{ '--progress': `${percentage}%` } as React.CSSProperties}
          />
        )}
      </div>
      <span className={styles.time}>{formatTime(duration)}</span>
    </div>
  );
}
