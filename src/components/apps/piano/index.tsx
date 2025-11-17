/**
 * Virtual E-Piano Window Component (Demo Version)
 * Minimal demo version with link to full standalone app
 */

export { PianoIcon } from './icon';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePianoAudio } from './hooks/use-piano-audio';
import { useKeyboardInput } from './hooks/use-keyboard-input';
import { useStore } from '@/store';
import PianoKeyboard from './piano-keyboard';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

// TODO: Update this URL when you deploy the full version
const FULL_VERSION_URL = 'https://virtual-piano.styltsou.dev'; // Placeholder - update with actual URL

export default function PianoWindow() {
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());
  const mousePressedRef = useRef<boolean>(false);

  // Check if this window is active/focused
  const activeWindowId = useStore(state => state.activeWindowId);
  const isWindowActive = activeWindowId === 'piano';

  // Audio hook (simplified - no MIDI, no advanced features)
  const {
    playNote: playAudioNote,
    stopNote: stopAudioNote,
    setVolume,
    volume,
  } = usePianoAudio();

  // Keyboard input hook - only enable when window is active
  const {
    octave,
    setOctave,
    setOnKeyPress: setKeyboardNoteOn,
    setOnKeyRelease: setKeyboardNoteRelease,
    setEnabled: setKeyboardEnabled,
  } = useKeyboardInput();

  // Handle note press
  const handleNotePress = useCallback(
    (note: string, isMousePress: boolean = false) => {
      if (isMousePress) {
        mousePressedRef.current = true;
      }
      setPressedNotes(prev => {
        const next = new Set(prev);
        next.add(note);
        return next;
      });
      playAudioNote(note, 0.7);
    },
    [playAudioNote]
  );

  // Handle note release
  const handleNoteRelease = useCallback(
    (note: string) => {
      setPressedNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        // Reset mouse press flag if this was the last note
        if (next.size === 0) {
          mousePressedRef.current = false;
        }
        return next;
      });
      stopAudioNote(note);
    },
    [stopAudioNote]
  );

  // Set up keyboard callbacks
  useEffect(() => {
    setKeyboardNoteOn((note: string) => {
      handleNotePress(note);
    });

    setKeyboardNoteRelease((note: string) => {
      handleNoteRelease(note);
    });
  }, [
    setKeyboardNoteOn,
    setKeyboardNoteRelease,
    handleNotePress,
    handleNoteRelease,
  ]);

  // Enable/disable keyboard input based on window focus
  useEffect(() => {
    setKeyboardEnabled(isWindowActive);
    // If window becomes inactive, release all pressed notes
    if (!isWindowActive) {
      const notesToRelease = Array.from(pressedNotes);
      notesToRelease.forEach(note => {
        stopAudioNote(note);
      });
      setPressedNotes(new Set());
      mousePressedRef.current = false;
    }
  }, [isWindowActive, setKeyboardEnabled, pressedNotes, stopAudioNote]);

  // Handle global mouse up - catch mouse releases outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Only release notes if we were in a mouse press operation
      if (mousePressedRef.current) {
        mousePressedRef.current = false;
        const notesToRelease = Array.from(pressedNotes);
        notesToRelease.forEach(note => {
          stopAudioNote(note);
        });
        setPressedNotes(new Set());
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [pressedNotes, stopAudioNote]);

  return (
    <div className={cn('piano-window', styles.container)}>
      {/* Demo Banner */}
      <div className={styles.demoBanner}>
        <div className={styles.demoBannerContent}>
          <span className={styles.demoLabel}>DEMO VERSION</span>
          <a
            href={FULL_VERSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fullVersionLink}
          >
            Open Full Version
          </a>
        </div>
      </div>

      <div className={styles.content}>
        {/* Piano Keyboard */}
        <div className={styles.keyboardSection}>
          <PianoKeyboard
            octave={octave}
            numOctaves={1.5}
            pressedNotes={pressedNotes}
            onKeyPress={handleNotePress}
            onKeyRelease={handleNoteRelease}
          />
        </div>

        {/* Minimal Controls */}
        <div className={styles.minimalControls}>
          <div className={styles.controlGroup}>
            <label className={styles.label}>Volume</label>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.value}>{volume}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <p className={styles.instructionText}>
          <strong>Demo:</strong> Click keys or use keyboard:
          A-S-D-F-G-H-J-K-L-;-' (white), W-E-T-Y-U-I-O (black)
        </p>
        <p className={styles.instructionText}>
          <a
            href={FULL_VERSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Try the full version with MIDI support, multiple octaves, and more
            features →
          </a>
        </p>
      </div>
    </div>
  );
}
