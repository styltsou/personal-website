/**
 * Piano Keyboard Component
 * Renders white and black keys with visual feedback
 */

import { useCallback } from 'react';
import {
  PIANO_KEY_ORDER,
  DEFAULT_OCTAVES,
  MIN_OCTAVE,
  MAX_OCTAVE,
} from '../constants';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

interface PianoKeyboardProps {
  octave: number;
  numOctaves?: number;
  pressedNotes: Set<string>;
  onKeyPress: (note: string, isMousePress?: boolean) => void;
  onKeyRelease: (note: string) => void;
}

export default function PianoKeyboard({
  octave,
  numOctaves = DEFAULT_OCTAVES,
  pressedNotes,
  onKeyPress,
  onKeyRelease,
}: PianoKeyboardProps) {
  // Generate all keys for the specified number of octaves
  const generateKeys = useCallback(() => {
    const keys: Array<{ note: string; isBlackKey: boolean; fullNote: string }> =
      [];
    const startOctave = Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, octave));

    // Handle fractional octaves (e.g., 1.5)
    const fullOctaves = Math.floor(numOctaves);
    const partialOctave = numOctaves - fullOctaves;

    // Generate full octaves
    const endOctave = Math.min(MAX_OCTAVE, startOctave + fullOctaves - 1);
    for (let oct = startOctave; oct <= endOctave; oct++) {
      PIANO_KEY_ORDER.forEach(({ note, isBlackKey }) => {
        keys.push({
          note,
          isBlackKey,
          fullNote: `${note}${oct}`,
        });
      });
    }

    // Generate partial octave if needed (for 1.5 octaves, add first 6 notes: C, C#, D, D#, E, F)
    if (partialOctave > 0 && endOctave < MAX_OCTAVE) {
      const nextOctave = endOctave + 1;
      // First 6 notes of an octave: C, C#, D, D#, E, F
      const partialNotes = PIANO_KEY_ORDER.slice(0, 6);
      partialNotes.forEach(({ note, isBlackKey }) => {
        keys.push({
          note,
          isBlackKey,
          fullNote: `${note}${nextOctave}`,
        });
      });
    }

    return keys;
  }, [octave, numOctaves]);

  const keys = generateKeys();

  // Separate white and black keys for rendering
  const whiteKeys = keys.filter(key => !key.isBlackKey);
  const blackKeys = keys.filter(key => key.isBlackKey);

  // Calculate black key width: 2/3 of a white key width
  // Each white key is 100 / whiteKeys.length percent, so black key is (100 / whiteKeys.length) * (2/3)
  const whiteKeyWidthPercent = 100 / whiteKeys.length;
  const blackKeyWidthPercent = whiteKeyWidthPercent * (2 / 3);

  // Calculate black key position based on piano layout
  // Black keys are positioned exactly in the middle between two white keys:
  // C# between C and D, D# between D and E, F# between F and G, G# between G and A, A# between A and B
  const getBlackKeyPosition = useCallback(
    (blackKey: (typeof blackKeys)[0], whiteKeysList: typeof whiteKeys) => {
      const noteName = blackKey.note;
      const octave = parseInt(blackKey.fullNote.match(/\d+$/)?.[0] || '0', 10);

      // Find the start octave in our white keys list
      const firstOctave = parseInt(
        whiteKeysList[0]?.fullNote.match(/\d+$/)?.[0] || '0',
        10
      );
      const octaveOffset = octave - firstOctave;

      // Map black key to the white key index it comes AFTER (the first white key in the pair)
      // In one octave: C=0, D=1, E=2, F=3, G=4, A=5, B=6
      // Black keys are positioned between:
      // C# between C(0) and D(1) -> after white key 0
      // D# between D(1) and E(2) -> after white key 1
      // F# between F(3) and G(4) -> after white key 3
      // G# between G(4) and A(5) -> after white key 4
      // A# between A(5) and B(6) -> after white key 5
      let whiteKeyIndexInOctave = 0;
      if (noteName === 'C#')
        whiteKeyIndexInOctave = 0; // Between C and D
      else if (noteName === 'D#')
        whiteKeyIndexInOctave = 1; // Between D and E
      else if (noteName === 'F#')
        whiteKeyIndexInOctave = 3; // Between F and G
      else if (noteName === 'G#')
        whiteKeyIndexInOctave = 4; // Between G and A
      else if (noteName === 'A#')
        whiteKeyIndexInOctave = 5; // Between A and B
      else return 0; // Fallback

      // Calculate the white key index in the full list (7 white keys per octave)
      const whiteKeyIndex = octaveOffset * 7 + whiteKeyIndexInOctave;

      // Position the black key so its center aligns with the boundary between two white keys
      // Each white key takes up 1/whiteKeys.length of the total width
      const whiteKeyWidth = 100 / whiteKeysList.length;
      // Position at the boundary between whiteKeyIndex and whiteKeyIndex+1
      // Since we use transform: translateX(-50%), the center will be at this boundary
      const position = (whiteKeyIndex + 1) * whiteKeyWidth;

      return position;
    },
    []
  );

  // Handle key mouse down
  const handleKeyDown = useCallback(
    (e: React.MouseEvent, note: string) => {
      e.preventDefault();
      onKeyPress(note, true); // true indicates this is a mouse press
    },
    [onKeyPress]
  );

  // Handle key mouse up
  const handleKeyUp = useCallback(
    (e: React.MouseEvent, note: string) => {
      e.preventDefault();
      onKeyRelease(note);
    },
    [onKeyRelease]
  );

  // Handle mouse leave (release key if mouse leaves while pressed)
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent, note: string) => {
      if (e.buttons === 1) {
        // Mouse button is still pressed
        onKeyRelease(note);
      }
    },
    [onKeyRelease]
  );

  return (
    <div className={styles.keyboardContainer}>
      <div className={styles.keyboard}>
        {/* White keys */}
        <div className={styles.whiteKeys}>
          {whiteKeys.map(key => {
            const isPressed = pressedNotes.has(key.fullNote);
            // Only show octave number on C keys
            const displayLabel = key.note === 'C' ? key.fullNote : key.note;
            return (
              <div
                key={key.fullNote}
                className={cn(styles.whiteKey, isPressed && styles.pressed)}
                onMouseDown={e => handleKeyDown(e, key.fullNote)}
                onMouseUp={e => handleKeyUp(e, key.fullNote)}
                onMouseLeave={e => handleMouseLeave(e, key.fullNote)}
                title={key.fullNote}
              >
                <span className={styles.keyLabel}>{displayLabel}</span>
              </div>
            );
          })}
        </div>

        {/* Black keys */}
        <div className={styles.blackKeys}>
          {blackKeys.map(key => {
            const isPressed = pressedNotes.has(key.fullNote);
            const position = getBlackKeyPosition(key, whiteKeys);
            // Only show octave number on C keys (but C# is not C, so just show note name)
            const displayLabel = key.note;

            return (
              <div
                key={key.fullNote}
                className={cn(styles.blackKey, isPressed && styles.pressed)}
                style={{
                  left: `${position}%`,
                  width: `${blackKeyWidthPercent}%`,
                }}
                onMouseDown={e => handleKeyDown(e, key.fullNote)}
                onMouseUp={e => handleKeyUp(e, key.fullNote)}
                onMouseLeave={e => handleMouseLeave(e, key.fullNote)}
                title={key.fullNote}
              >
                <span className={styles.keyLabel}>{displayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
