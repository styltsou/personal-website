/**
 * Constants for Virtual E-Piano
 */

// Note frequencies for A4 = 440Hz
// Formula: frequency = 440 * 2^((midiNumber - 69) / 12)
export const NOTE_FREQUENCIES: Record<string, number> = {
  // Octave 0
  'C0': 16.35, 'C#0': 17.32, 'D0': 18.35, 'D#0': 19.45, 'E0': 20.60, 'F0': 21.83,
  'F#0': 23.12, 'G0': 24.50, 'G#0': 25.96, 'A0': 27.50, 'A#0': 29.14, 'B0': 30.87,
  // Octave 1
  'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65,
  'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
  // Octave 2
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  // Octave 3
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  // Octave 4 (middle C)
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  // Octave 5
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  // Octave 6
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91,
  'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,
  // Octave 7
  'C7': 2093.00, 'C#7': 2217.46, 'D7': 2349.32, 'D#7': 2489.02, 'E7': 2637.02, 'F7': 2793.83,
  'F#7': 2959.96, 'G7': 3135.96, 'G#7': 3322.44, 'A7': 3520.00, 'A#7': 3729.31, 'B7': 3951.07,
  // Octave 8
  'C8': 4186.01,
};

// MIDI note numbers (0-127)
// C0 = 12, C4 = 60, A4 = 69, C8 = 108
export const MIDI_NOTE_NUMBERS: Record<string, number> = {
  'C0': 12, 'C#0': 13, 'D0': 14, 'D#0': 15, 'E0': 16, 'F0': 17,
  'F#0': 18, 'G0': 19, 'G#0': 20, 'A0': 21, 'A#0': 22, 'B0': 23,
  'C1': 24, 'C#1': 25, 'D1': 26, 'D#1': 27, 'E1': 28, 'F1': 29,
  'F#1': 30, 'G1': 31, 'G#1': 32, 'A1': 33, 'A#1': 34, 'B1': 35,
  'C2': 36, 'C#2': 37, 'D2': 38, 'D#2': 39, 'E2': 40, 'F2': 41,
  'F#2': 42, 'G2': 43, 'G#2': 44, 'A2': 45, 'A#2': 46, 'B2': 47,
  'C3': 48, 'C#3': 49, 'D3': 50, 'D#3': 51, 'E3': 52, 'F3': 53,
  'F#3': 54, 'G3': 55, 'G#3': 56, 'A3': 57, 'A#3': 58, 'B3': 59,
  'C4': 60, 'C#4': 61, 'D4': 62, 'D#4': 63, 'E4': 64, 'F4': 65,
  'F#4': 66, 'G4': 67, 'G#4': 68, 'A4': 69, 'A#4': 70, 'B4': 71,
  'C5': 72, 'C#5': 73, 'D5': 74, 'D#5': 75, 'E5': 76, 'F5': 77,
  'F#5': 78, 'G5': 79, 'G#5': 80, 'A5': 81, 'A#5': 82, 'B5': 83,
  'C6': 84, 'C#6': 85, 'D6': 86, 'D#6': 87, 'E6': 88, 'F6': 89,
  'F#6': 90, 'G6': 91, 'G#6': 92, 'A6': 93, 'A#6': 94, 'B6': 95,
  'C7': 96, 'C#7': 97, 'D7': 98, 'D#7': 99, 'E7': 100, 'F7': 101,
  'F#7': 102, 'G7': 103, 'G#7': 104, 'A7': 105, 'A#7': 106, 'B7': 107,
  'C8': 108,
};

// ADSR envelope parameters (in seconds) - E-Piano/Rhodes style (smoother)
export const ADSR_ENVELOPE = {
  attack: 0.005,  // Slightly longer attack for smoother onset
  decay: 0.03,    // Slightly longer decay for smoother transition
  sustain: 0.9,   // High sustain level (e-piano holds well)
  release: 0.5,   // Subtle release for gentle fade-out
};

// Default piano settings
export const DEFAULT_VOLUME = 50; // 0-100
export const DEFAULT_OCTAVE = 4; // Middle C is C4
export const DEFAULT_WAVEFORM: OscillatorType = 'sawtooth'; // Sawtooth wave for brighter e-piano sound
export const DEFAULT_SUSTAIN = false;

// Keyboard mapping (computer keyboard to piano keys)
// Extended DAW keybindings: ~1.5 octaves
// Layout matches visual piano keys - top row keys are skipped where there are no black keys
// White keys: A, S, D, F, G, H, J, K, L, ;, ' (C, D, E, F, G, A, B, C, D, E, F)
// Black keys: W, E, [skip R], T, Y, U, [skip], I, O, [skip] (C#, D#, F#, G#, A#, C#, D#)
// Note: E-F and B-C are consecutive white keys (no black key between them)
// Top row keys are skipped to match the visual gaps in black keys
export const KEYBOARD_MAPPING: Record<string, { note: string; isBlackKey: boolean }> = {
  // White keys (first octave + start of second)
  'a': { note: 'C', isBlackKey: false },
  's': { note: 'D', isBlackKey: false },
  'd': { note: 'E', isBlackKey: false },
  'f': { note: 'F', isBlackKey: false },
  'g': { note: 'G', isBlackKey: false },
  'h': { note: 'A', isBlackKey: false },
  'j': { note: 'B', isBlackKey: false },
  'k': { note: 'C', isBlackKey: false }, // Second octave
  'l': { note: 'D', isBlackKey: false },
  ';': { note: 'E', isBlackKey: false },
  "'": { note: 'F', isBlackKey: false },
  // Black keys (first octave + start of second)
  // Layout matches visual: C#(w), D#(e), [skip R - no black key between E-F], F#(t), G#(y), A#(u), [skip - no black key between B-C], C#(i), D#(o), [skip - no black key between E-F]
  'w': { note: 'C#', isBlackKey: true },
  'e': { note: 'D#', isBlackKey: true },
  // Skip 'r' - no black key between E and F
  't': { note: 'F#', isBlackKey: true },
  'y': { note: 'G#', isBlackKey: true },
  'u': { note: 'A#', isBlackKey: true },
  // Skip position - no black key between B and C
  'i': { note: 'C#', isBlackKey: true }, // Second octave
  'o': { note: 'D#', isBlackKey: true },
  // Skip position - no black key between E and F in second octave
};

// Piano key order for rendering (one octave)
export const PIANO_KEY_ORDER: Array<{ note: string; isBlackKey: boolean }> = [
  { note: 'C', isBlackKey: false },
  { note: 'C#', isBlackKey: true },
  { note: 'D', isBlackKey: false },
  { note: 'D#', isBlackKey: true },
  { note: 'E', isBlackKey: false },
  { note: 'F', isBlackKey: false },
  { note: 'F#', isBlackKey: true },
  { note: 'G', isBlackKey: false },
  { note: 'G#', isBlackKey: true },
  { note: 'A', isBlackKey: false },
  { note: 'A#', isBlackKey: true },
  { note: 'B', isBlackKey: false },
];

// Number of octaves to display (default 2 octaves)
export const DEFAULT_OCTAVES = 2;
export const MIN_OCTAVE = 2;
export const MAX_OCTAVE = 6;

