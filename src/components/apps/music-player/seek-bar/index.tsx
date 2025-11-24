/**
 * SeekBar Component
 * Progress bar with time display and seek functionality
 */

import * as Slider from '@radix-ui/react-slider';
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

  const handleValueChange = (values: number[]) => {
    const value = values[0];
    // Only seek if duration is valid
    if (duration > 0) {
      onSeek(value);
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.time}>{formatTime(currentTime)}</span>
      <div
        className={`${styles.sliderWrapper} ${isBuffering ? styles.buffering : ''}`}
      >
        <Slider.Root
          className={styles.slider}
          min={0}
          max={safeDuration}
          step={0.1}
          value={[safeCurrentTime]}
          onValueChange={handleValueChange}
          disabled={duration <= 0}
          style={{ '--progress': `${percentage}%` } as React.CSSProperties}
        >
          <Slider.Track className={styles.track}>
            <Slider.Range className={styles.range} />
          </Slider.Track>
          <Slider.Thumb
            className={styles.thumb}
            aria-label="Seek through track"
          />
        </Slider.Root>
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
