/**
 * ControlPanel Component
 * Play, pause, next, previous, and loop controls
 */

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
} from 'lucide-react';

import { useMusicPlayer } from '../context';
import styles from './control-panel.module.scss';

export default function ControlPanel() {
  const {
    isPlaying,
    loopMode,
    isShuffled,
    play,
    pause,
    next,
    previous,
    toggleLoop,
    toggleShuffle,
  } = useMusicPlayer();
  const getLoopTitle = () => {
    switch (loopMode) {
      case 'none':
        return 'Loop: Off (click to loop playlist)';
      case 'playlist':
        return 'Loop: Playlist (click to loop current song)';
      case 'song':
        return 'Loop: Current song (click to turn off)';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.shuffleWrapper}>
        <button
          className={`${styles.button} ${isShuffled ? styles.shuffleActive : ''}`}
          onClick={toggleShuffle}
          aria-label={
            isShuffled
              ? 'Shuffle: On (click to turn off)'
              : 'Shuffle: Off (click to turn on)'
          }
          title={
            isShuffled
              ? 'Shuffle: On (click to turn off)'
              : 'Shuffle: Off (click to turn on)'
          }
        >
          <Shuffle size={18} strokeWidth={2} />
        </button>
      </div>
      <div className={styles.mainControls}>
        <button
          className={styles.button}
          onClick={previous}
          aria-label="Previous track"
          title="Previous track"
        >
          <SkipBack size={18} strokeWidth={2} />
        </button>
        <button
          className={styles.button}
          onClick={isPlaying ? pause : play}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={18} strokeWidth={2} />
          ) : (
            <Play size={18} strokeWidth={2} />
          )}
        </button>
        <button
          className={styles.button}
          onClick={next}
          aria-label="Next track"
          title="Next track"
        >
          <SkipForward size={18} strokeWidth={2} />
        </button>
      </div>
      <div className={styles.loopWrapper}>
        <button
          className={`${styles.button} ${loopMode !== 'none' ? styles.loopActive : ''}`}
          onClick={toggleLoop}
          aria-label={getLoopTitle()}
          title={getLoopTitle()}
        >
          {loopMode === 'song' ? (
            <Repeat1 size={18} strokeWidth={2} />
          ) : (
            <Repeat size={18} strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
