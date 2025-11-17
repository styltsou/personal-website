/**
 * TypeScript types and interfaces for Virtual E-Piano
 */

export interface Note {
  note: string; // e.g., "C4", "C#4", "D4"
  frequency: number;
  midiNumber: number;
  isBlackKey: boolean;
}

export interface ActiveNote {
  note: string;
  oscillators: OscillatorNode[]; // Multiple oscillators for lush chorus effect
  gainNode: GainNode;
  filterNode: BiquadFilterNode; // Low-pass filter for warmth
  startTime: number;
  velocity: number; // 0-127 for MIDI, 0-1 for keyboard
}

export interface PianoState {
  volume: number; // 0-100
  octave: number; // Base octave offset (0-8, default 4)
  sustain: boolean;
  waveform: OscillatorType; // 'sine' | 'square' | 'sawtooth' | 'triangle'
  activeNotes: Map<string, ActiveNote>;
}

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer?: string;
  state: 'connected' | 'disconnected';
}

export interface KeyboardMapping {
  [key: string]: {
    note: string;
    isBlackKey: boolean;
  };
}
