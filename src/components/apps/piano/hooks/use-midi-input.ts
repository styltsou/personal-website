/**
 * Hook for managing MIDI input from external devices
 * Uses Web MIDI API to connect to MIDI keyboards and controllers
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MIDIDevice } from '../types';

interface UseMIDIInputReturn {
  devices: MIDIDevice[];
  isSupported: boolean;
  isRequesting: boolean;
  requestAccess: () => Promise<void>;
  onNoteOn?: (note: number, velocity: number) => void;
  onNoteOff?: (note: number) => void;
  setOnNoteOn: (callback: (note: number, velocity: number) => void) => void;
  setOnNoteOff: (callback: (note: number) => void) => void;
}

export function useMIDIInput(): UseMIDIInputReturn {
  const [devices, setDevices] = useState<MIDIDevice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const onNoteOnRef = useRef<
    ((note: number, velocity: number) => void) | undefined
  >();
  const onNoteOffRef = useRef<((note: number) => void) | undefined>();
  const midiAccessRef = useRef<MIDIAccess | null>(null);

  // Check if MIDI is supported
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'requestMIDIAccess' in navigator;
    setIsSupported(supported);
  }, []);

  // Convert MIDI note number to note name (e.g., 60 -> "C4")

  const _midiToNoteName = useCallback((midiNumber: number): string => {
    const octave = Math.floor((midiNumber - 12) / 12);
    const noteIndex = (midiNumber - 12) % 12;
    const noteNames = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ];
    return `${noteNames[noteIndex]}${octave}`;
  }, []);

  // Handle MIDI message
  const handleMIDIMessage = useCallback((event: MIDIMessageEvent) => {
    const [status, note, velocity] = event.data;

    // Note On (0x90-0x9F) or Note Off (0x80-0x8F)
    const command = status & 0xf0;

    if (command === 0x90 && velocity > 0) {
      // Note On
      if (onNoteOnRef.current) {
        onNoteOnRef.current(note, velocity);
      }
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      // Note Off
      if (onNoteOffRef.current) {
        onNoteOffRef.current(note);
      }
    }
  }, []);

  // Request MIDI access
  const requestAccess = useCallback(async () => {
    if (typeof window === 'undefined' || !('requestMIDIAccess' in navigator)) {
      console.warn('Web MIDI API not supported');
      return;
    }

    setIsRequesting(true);
    try {
      const access = await navigator.requestMIDIAccess({ sysex: false });
      midiAccessRef.current = access;

      // Update device list
      const deviceList: MIDIDevice[] = [];
      access.inputs.forEach(input => {
        deviceList.push({
          id: input.id,
          name: input.name || 'Unknown Device',
          manufacturer: input.manufacturer || undefined,
          state: input.state === 'connected' ? 'connected' : 'disconnected',
        });

        // Add event listener for this input
        input.onmidimessage = handleMIDIMessage;
      });

      setDevices(deviceList);

      // Listen for device connections/disconnections
      access.onstatechange = event => {
        const port = event.port as MIDIInput;
        if (port.type === 'input') {
          const deviceList: MIDIDevice[] = [];
          access.inputs.forEach(input => {
            deviceList.push({
              id: input.id,
              name: input.name || 'Unknown Device',
              manufacturer: input.manufacturer || undefined,
              state: input.state === 'connected' ? 'connected' : 'disconnected',
            });

            // Re-add event listener if needed
            if (input.onmidimessage !== handleMIDIMessage) {
              input.onmidimessage = handleMIDIMessage;
            }
          });
          setDevices(deviceList);
        }
      };
    } catch (error) {
      console.error('Error requesting MIDI access:', error);
    } finally {
      setIsRequesting(false);
    }
  }, [handleMIDIMessage]);

  // Set note on callback
  const setOnNoteOn = useCallback(
    (callback: (note: number, velocity: number) => void) => {
      onNoteOnRef.current = callback;
    },
    []
  );

  // Set note off callback
  const setOnNoteOff = useCallback((callback: (note: number) => void) => {
    onNoteOffRef.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (midiAccessRef.current) {
        midiAccessRef.current.inputs.forEach(input => {
          input.onmidimessage = null;
        });
      }
    };
  }, []);

  return {
    devices,
    isSupported,
    isRequesting,
    requestAccess,
    onNoteOn: onNoteOnRef.current,
    onNoteOff: onNoteOffRef.current,
    setOnNoteOn,
    setOnNoteOff,
  };
}
