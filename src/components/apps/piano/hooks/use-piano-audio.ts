/**
 * Hook for managing piano audio using Web Audio API
 * Handles sound generation, ADSR envelope, polyphony, and sustain
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import type { ActiveNote, PianoState } from '../types';
import { ADSR_ENVELOPE, DEFAULT_VOLUME, DEFAULT_WAVEFORM, DEFAULT_SUSTAIN } from '../constants';

interface UsePianoAudioReturn {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  playNote: (note: string, velocity?: number) => void;
  stopNote: (note: string) => void;
  stopAllNotes: () => void;
  setVolume: (volume: number) => void;
  setWaveform: (waveform: OscillatorType) => void;
  setSustain: (sustain: boolean) => void;
  volume: number;
  waveform: OscillatorType;
  sustain: boolean;
  activeNotes: Map<string, ActiveNote>;
}

export function usePianoAudio(): UsePianoAudioReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNotesRef = useRef<Map<string, ActiveNote>>(new Map());
  const sustainRef = useRef<boolean>(DEFAULT_SUSTAIN);
  const waveformRef = useRef<OscillatorType>(DEFAULT_WAVEFORM);

  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [waveform, setWaveformState] = useState<OscillatorType>(DEFAULT_WAVEFORM);
  const [sustain, setSustainState] = useState(DEFAULT_SUSTAIN);
  const [activeNotes, setActiveNotes] = useState<Map<string, ActiveNote>>(new Map());

  // Initialize AudioContext on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Create master gain node
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.value = volume / 100;
      masterGainRef.current = masterGain;

      // Resume context on user interaction (required by browsers)
      const resumeContext = () => {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      };
      document.addEventListener('click', resumeContext, { once: true });
      document.addEventListener('keydown', resumeContext, { once: true });

      return () => {
        // Cleanup: stop all notes and close context
        stopAllNotes();
        ctx.close();
      };
    } catch (error) {
      console.error('Error initializing AudioContext:', error);
    }
  }, []);

  // Update master gain when volume changes
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  // Update waveform ref when it changes
  useEffect(() => {
    waveformRef.current = waveform;
  }, [waveform]);

  // Update sustain ref when it changes
  useEffect(() => {
    sustainRef.current = sustain;
  }, [sustain]);

  // Apply ADSR envelope to a gain node
  const applyADSR = useCallback((
    gainNode: GainNode,
    velocity: number,
    startTime: number,
    duration?: number
  ) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const attackEnd = now + ADSR_ENVELOPE.attack;
    const decayEnd = attackEnd + ADSR_ENVELOPE.decay;
    const releaseStart = duration ? startTime + duration : null;

    // Set initial gain to a very small value (exponential ramps can't start from 0)
    gainNode.gain.setValueAtTime(0.001, now);

    // Attack phase: exponential ramp to full velocity (smoother than linear)
    gainNode.gain.exponentialRampToValueAtTime(velocity, attackEnd);

    // Decay phase: exponential ramp to sustain level (smoother transition)
    const sustainLevel = velocity * ADSR_ENVELOPE.sustain;
    gainNode.gain.exponentialRampToValueAtTime(sustainLevel, decayEnd);

    // If duration is specified, schedule release
    if (releaseStart) {
      gainNode.gain.setValueAtTime(sustainLevel, releaseStart);
      gainNode.gain.exponentialRampToValueAtTime(0.001, releaseStart + ADSR_ENVELOPE.release); // Use small value instead of 0 for exponential
    }
  }, []);

  // Play a note
  const playNote = useCallback((note: string, velocity: number = 0.7) => {
    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;

    // If note is already playing, stop it first to allow retriggering
    if (activeNotesRef.current.has(note)) {
      const existingNote = activeNotesRef.current.get(note);
      if (existingNote) {
        // Quickly stop the existing note
        const now = ctx.currentTime;
        try {
          // Get the actual scheduled value at this time before canceling
          const scheduledGain = existingNote.gainNode.gain.getValueAtTime(now);
          existingNote.gainNode.gain.cancelScheduledValues(now);
          const currentGain = Math.max(scheduledGain, 0.001);
          existingNote.gainNode.gain.setValueAtTime(currentGain, now);
          existingNote.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.01); // Quick fade
          existingNote.oscillators.forEach((osc) => {
            try {
              osc.stop(now + 0.01);
            } catch (error) {
              // Oscillator might already be stopped
            }
          });
          // Remove immediately to allow retrigger
          activeNotesRef.current.delete(note);
          setActiveNotes(new Map(activeNotesRef.current));
        } catch (error) {
          // If there's an error, force cleanup
          try {
            existingNote.oscillators.forEach((osc) => {
              try {
                osc.stop();
              } catch (e) {
                // Ignore
              }
            });
          } catch (e) {
            // Ignore
          }
          activeNotesRef.current.delete(note);
          setActiveNotes(new Map(activeNotesRef.current));
        }
      }
    }

    // Get frequency from note name (e.g., "C4" -> 261.63)
    // For now, we'll calculate it from MIDI note number
    // This is a simplified version - in production, you'd use a proper note parser
    const frequency = getFrequencyFromNote(note);
    if (!frequency) {
      console.warn(`Unknown note: ${note}`);
      return;
    }

    try {
      // Create multiple oscillators with slight detuning for lush chorus effect
      const oscillators: OscillatorNode[] = [];
      const detuneAmounts = [0, 1.5, -1.5]; // Center, slightly sharp, slightly flat (in cents) - reduced for smoother sound
      const oscillatorGains: GainNode[] = [];

      // Create a master gain node for this note
      const gainNode = ctx.createGain();
      
      // Create a low-pass filter for warmth and character
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 3500; // Lower cutoff for smoother, warmer sound
      filterNode.Q.value = 0.8; // Lower resonance for smoother filter response
      
      // Connect: oscillators -> individual gains -> filter -> master gain -> master output
      filterNode.connect(gainNode);
      gainNode.connect(masterGain);

      // Create multiple oscillators with detuning
      detuneAmounts.forEach((detune, index) => {
        const oscillator = ctx.createOscillator();
        oscillator.type = waveformRef.current;
        oscillator.frequency.value = frequency;
        oscillator.detune.value = detune; // Detune in cents for chorus effect

        // Individual gain for each oscillator (slightly lower for side oscillators)
        const oscGain = ctx.createGain();
        const oscVolume = index === 0 ? 1.0 : 0.45; // Center oscillator louder, side oscillators quieter for smoother blend
        oscGain.gain.value = oscVolume;
        
        oscillator.connect(oscGain);
        oscGain.connect(filterNode);
        
        oscillators.push(oscillator);
        oscillatorGains.push(oscGain);
      });

      // Apply ADSR envelope to master gain
      const startTime = ctx.currentTime;
      applyADSR(gainNode, velocity, startTime);

      // Start all oscillators
      oscillators.forEach((osc) => {
        osc.start(startTime);
      });

      // Store active note
      const activeNote: ActiveNote = {
        note,
        oscillators,
        gainNode,
        filterNode,
        startTime,
        velocity,
      };
      activeNotesRef.current.set(note, activeNote);
      setActiveNotes(new Map(activeNotesRef.current));

      // Handle note end (when oscillators stop naturally)
      // Note: This is a fallback - we also clean up in stopNote
      let endedCount = 0;
      const onOscillatorEnd = () => {
        endedCount++;
        if (endedCount === oscillators.length) {
          // All oscillators ended, clean up
          // Only clean up if note is still in activeNotes (might have been removed by stopNote)
          if (activeNotesRef.current.has(note)) {
            activeNotesRef.current.delete(note);
            setActiveNotes(new Map(activeNotesRef.current));
          }
        }
      };
      
      oscillators.forEach((osc) => {
        osc.onended = onOscillatorEnd;
      });
    } catch (error) {
      console.error(`Error playing note ${note}:`, error);
    }
  }, [applyADSR]);

  // Stop a note
  const stopNote = useCallback((note: string) => {
    const activeNote = activeNotesRef.current.get(note);
    if (!activeNote) return;

    const ctx = audioContextRef.current;
    if (!ctx) return;

    // If sustain is on, don't release immediately
    if (sustainRef.current) {
      // Mark for release but keep playing
      // We'll handle this by checking sustain state on release
      return;
    }

    // Apply release envelope
    const now = ctx.currentTime;
    
    // Cancel any scheduled changes and get current gain value
    try {
      // Get the actual scheduled value at this time before canceling
      const scheduledGain = activeNote.gainNode.gain.getValueAtTime(now);
      activeNote.gainNode.gain.cancelScheduledValues(now);
      const currentGain = Math.max(scheduledGain, 0.001); // Ensure minimum value for exponential ramp
      
      // Set current gain and ramp to zero (exponential for smoother fade)
      // Ensure we have a valid starting point for exponential ramp
      if (currentGain <= 0.001) {
        // If gain is already very low, just stop immediately
        activeNote.gainNode.gain.setValueAtTime(0.001, now);
        activeNote.oscillators.forEach((osc) => {
          try {
            osc.stop(now);
          } catch (error) {
            // Ignore
          }
        });
        activeNotesRef.current.delete(note);
        setActiveNotes(new Map(activeNotesRef.current));
      } else {
        // Normal release: ramp down then stop
        activeNote.gainNode.gain.setValueAtTime(currentGain, now);
        activeNote.gainNode.gain.exponentialRampToValueAtTime(0.001, now + ADSR_ENVELOPE.release);

        // Stop all oscillators after release completes
        const stopTime = now + ADSR_ENVELOPE.release;
        activeNote.oscillators.forEach((osc) => {
          try {
            osc.stop(stopTime);
          } catch (error) {
            // Oscillator might already be stopped - ignore
          }
        });

        // Remove from active notes immediately to prevent retrigger issues
        // The oscillators will stop themselves at stopTime, and onended callbacks will handle final cleanup
        activeNotesRef.current.delete(note);
        setActiveNotes(new Map(activeNotesRef.current));
      }
    } catch (error) {
      // If there's an error, force cleanup immediately
      console.warn('Error stopping note:', error);
      try {
        activeNote.oscillators.forEach((osc) => {
          try {
            osc.stop();
          } catch (e) {
            // Ignore
          }
        });
      } catch (e) {
        // Ignore
      }
      activeNotesRef.current.delete(note);
      setActiveNotes(new Map(activeNotesRef.current));
    }
  }, []);

  // Stop all notes
  const stopAllNotes = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const now = ctx.currentTime;
    const notesToStop = Array.from(activeNotesRef.current.entries());
    
    notesToStop.forEach(([note, activeNote]) => {
      try {
        activeNote.gainNode.gain.cancelScheduledValues(now);
        const currentGain = activeNote.gainNode.gain.value;
        activeNote.gainNode.gain.setValueAtTime(currentGain, now);
        activeNote.gainNode.gain.exponentialRampToValueAtTime(0.001, now + ADSR_ENVELOPE.release); // Use small value instead of 0 for exponential
        activeNote.oscillators.forEach((osc) => {
          try {
            osc.stop(now + ADSR_ENVELOPE.release);
          } catch (error) {
            console.warn('Error stopping oscillator:', error);
          }
        });
      } catch (error) {
        // Oscillator might already be stopped
        console.warn('Error stopping note:', error);
      }
    });

    // Clear immediately for UI responsiveness, but oscillators will fade out
    activeNotesRef.current.clear();
    setActiveNotes(new Map());
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  // Set waveform
  const setWaveform = useCallback((newWaveform: OscillatorType) => {
    setWaveformState(newWaveform);
    // Update existing oscillators? For now, only new notes will use new waveform
  }, []);

  // Set sustain
  const setSustain = useCallback((newSustain: boolean) => {
    setSustainState(newSustain);
    // If sustain is turned off, release all sustained notes
    if (!newSustain) {
      const ctx = audioContextRef.current;
      if (ctx) {
        const now = ctx.currentTime;
        activeNotesRef.current.forEach((activeNote) => {
          const currentGain = activeNote.gainNode.gain.value;
          activeNote.gainNode.gain.cancelScheduledValues(now);
          activeNote.gainNode.gain.setValueAtTime(currentGain, now);
          activeNote.gainNode.gain.linearRampToValueAtTime(0, now + ADSR_ENVELOPE.release);
          activeNote.oscillators.forEach((osc) => {
            try {
              osc.stop(now + ADSR_ENVELOPE.release);
            } catch (error) {
              console.warn('Error stopping oscillator:', error);
            }
          });
        });
        activeNotesRef.current.clear();
        setActiveNotes(new Map());
      }
    }
  }, []);

  return {
    audioContext: audioContextRef.current,
    masterGain: masterGainRef.current,
    playNote,
    stopNote,
    stopAllNotes,
    setVolume,
    setWaveform,
    setSustain,
    volume,
    waveform,
    sustain,
    activeNotes,
  };
}

// Helper function to get frequency from note name
function getFrequencyFromNote(note: string): number | null {
  // Import NOTE_FREQUENCIES dynamically to avoid circular dependency
  // For now, calculate from MIDI note number
  // Format: "C4", "C#4", "D4", etc.
  const match = note.match(/^([A-G]#?)(\d+)$/);
  if (!match) return null;

  const noteName = match[1];
  const octave = parseInt(match[2], 10);

  // Map note names to semitone offsets from C
  const noteOffsets: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
  };

  const offset = noteOffsets[noteName];
  if (offset === undefined) return null;

  // MIDI note number = 12 * octave + offset + 12 (C0 = 12)
  const midiNumber = 12 * octave + offset + 12;

  // Calculate frequency: 440 * 2^((midiNumber - 69) / 12)
  // A4 (MIDI 69) = 440 Hz
  return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

