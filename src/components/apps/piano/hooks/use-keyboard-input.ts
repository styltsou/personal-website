/**
 * Hook for mapping computer keyboard keys to piano keys
 * Handles key press/release events and octave shifting
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  KEYBOARD_MAPPING,
  DEFAULT_OCTAVE,
  MIN_OCTAVE,
  MAX_OCTAVE,
} from '../constants';

interface UseKeyboardInputReturn {
  octave: number;
  pressedKeys: Set<string>;
  setOctave: (octave: number) => void;
  onKeyPress?: (note: string) => void;
  onKeyRelease?: (note: string) => void;
  setOnKeyPress: (callback: (note: string) => void) => void;
  setOnKeyRelease: (callback: (note: string) => void) => void;
  setEnabled: (enabled: boolean) => void;
}

export function useKeyboardInput(): UseKeyboardInputReturn {
  const [octave, setOctaveState] = useState(DEFAULT_OCTAVE);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [enabled, setEnabledState] = useState(true);
  const onKeyPressRef = useRef<((note: string) => void) | undefined>(undefined);
  const onKeyReleaseRef = useRef<((note: string) => void) | undefined>(
    undefined
  );
  const currentlyPressedRef = useRef<Set<string>>(new Set());
  const enabledRef = useRef<boolean>(true);

  // Convert keyboard key to note name with octave
  // Keys K, L, ;, ', I, O map to the second octave
  const keyToNote = useCallback(
    (key: string, currentOctave: number): string | null => {
      const mapping = KEYBOARD_MAPPING[key.toLowerCase()];
      if (!mapping) return null;

      const { note } = mapping;
      // Keys that map to second octave: k, l, ;, ', i, o
      const secondOctaveKeys = ['k', 'l', ';', "'", 'i', 'o'];
      const octave = secondOctaveKeys.includes(key.toLowerCase())
        ? currentOctave + 1
        : currentOctave;
      return `${note}${octave}`;
    },
    []
  );

  // Handle key down
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only process if enabled
      if (!enabledRef.current) return;

      // Prevent default behavior for piano keys
      const key = event.key.toLowerCase();
      const mapping = KEYBOARD_MAPPING[key];

      // Handle octave shifting
      if (event.shiftKey && key === 'z') {
        // Shift + Z: decrease octave
        setOctaveState(prev => Math.max(MIN_OCTAVE, prev - 1));
        return;
      }
      if (event.shiftKey && key === 'x') {
        // Shift + X: increase octave
        setOctaveState(prev => Math.min(MAX_OCTAVE, prev + 1));
        return;
      }

      // Ignore if key is already pressed (prevent retriggering)
      if (currentlyPressedRef.current.has(key)) {
        return;
      }

      if (mapping) {
        event.preventDefault();
        const note = keyToNote(key, octave);
        if (note && onKeyPressRef.current) {
          currentlyPressedRef.current.add(key);
          setPressedKeys(new Set(currentlyPressedRef.current));
          onKeyPressRef.current(note);
        }
      }
    },
    [keyToNote, octave]
  );

  // Handle key up
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      // Only process if enabled
      if (!enabledRef.current) return;

      const key = event.key.toLowerCase();
      const mapping = KEYBOARD_MAPPING[key];

      if (mapping && currentlyPressedRef.current.has(key)) {
        event.preventDefault();
        const note = keyToNote(key, octave);
        if (note && onKeyReleaseRef.current) {
          currentlyPressedRef.current.delete(key);
          setPressedKeys(new Set(currentlyPressedRef.current));
          onKeyReleaseRef.current(note);
        }
      }
    },
    [keyToNote, octave]
  );

  // Set up keyboard event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Handle window blur - release all pressed keys if window loses focus
    // This prevents keys from getting stuck if keyup event doesn't fire
    const handleBlur = () => {
      if (enabledRef.current && currentlyPressedRef.current.size > 0) {
        const keysToRelease = Array.from(currentlyPressedRef.current);
        keysToRelease.forEach(key => {
          const mapping = KEYBOARD_MAPPING[key];
          if (mapping && onKeyReleaseRef.current) {
            const note = keyToNote(key, octave);
            if (note) {
              onKeyReleaseRef.current(note);
            }
          }
        });
        currentlyPressedRef.current.clear();
        setPressedKeys(new Set());
      }
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, keyToNote, octave]);

  // Set octave
  const setOctave = useCallback((newOctave: number) => {
    const clampedOctave = Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, newOctave));
    setOctaveState(clampedOctave);
  }, []);

  // Set key press callback
  const setOnKeyPress = useCallback((callback: (note: string) => void) => {
    onKeyPressRef.current = callback;
  }, []);

  // Set key release callback
  const setOnKeyRelease = useCallback((callback: (note: string) => void) => {
    onKeyReleaseRef.current = callback;
  }, []);

  // Set enabled state
  const setEnabled = useCallback(
    (newEnabled: boolean) => {
      setEnabledState(newEnabled);
      enabledRef.current = newEnabled;
      // Release all pressed keys when disabled
      if (!newEnabled) {
        currentlyPressedRef.current.forEach(key => {
          const mapping = KEYBOARD_MAPPING[key];
          if (mapping && onKeyReleaseRef.current) {
            const note = keyToNote(key, octave);
            if (note) {
              onKeyReleaseRef.current(note);
            }
          }
        });
        currentlyPressedRef.current.clear();
        setPressedKeys(new Set());
      }
    },
    [keyToNote, octave]
  );

  // Update enabled ref when state changes
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  return {
    octave,
    pressedKeys,
    setOctave,
    onKeyPress: onKeyPressRef.current,
    onKeyRelease: onKeyReleaseRef.current,
    setOnKeyPress,
    setOnKeyRelease,
    setEnabled,
  };
}
