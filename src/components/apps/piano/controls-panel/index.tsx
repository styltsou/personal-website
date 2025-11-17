/**
 * Controls Panel Component
 * Volume, octave, sustain, MIDI device selector, and other controls
 */

import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

interface ControlsPanelProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  octave: number;
  onOctaveChange: (octave: number) => void;
  sustain: boolean;
  onSustainChange: (sustain: boolean) => void;
  waveform: OscillatorType;
  onWaveformChange: (waveform: OscillatorType) => void;
  midiDevices: Array<{ id: string; name: string; state: string }>;
  isMIDISupported: boolean;
  isMIDIRequesting: boolean;
  onMIDIRequest: () => void;
  onStopAll: () => void;
}

export default function ControlsPanel({
  volume,
  onVolumeChange,
  octave,
  onOctaveChange,
  sustain,
  onSustainChange,
  waveform,
  onWaveformChange,
  midiDevices,
  isMIDISupported,
  isMIDIRequesting,
  onMIDIRequest,
  onStopAll,
}: ControlsPanelProps) {
  return (
    <div className={styles.controlsPanel}>
      <div className={styles.controlsRow}>
        {/* Volume Control */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>Volume</label>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={e => onVolumeChange(Number(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.value}>{volume}%</span>
          </div>
        </div>

        {/* Octave Control */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>Octave</label>
          <div className={styles.octaveControls}>
            <button
              className={cn(styles.button, styles.octaveButton)}
              onClick={() => onOctaveChange(octave - 1)}
              disabled={octave <= 2}
              title="Decrease octave (Shift+Z)"
            >
              −
            </button>
            <span className={styles.octaveValue}>{octave}</span>
            <button
              className={cn(styles.button, styles.octaveButton)}
              onClick={() => onOctaveChange(octave + 1)}
              disabled={octave >= 6}
              title="Increase octave (Shift+X)"
            >
              +
            </button>
          </div>
        </div>

        {/* Sustain Toggle */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>Sustain</label>
          <button
            className={cn(
              styles.button,
              styles.toggleButton,
              sustain && styles.active
            )}
            onClick={() => onSustainChange(!sustain)}
            title="Hold notes after release"
          >
            {sustain ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className={styles.controlsRow}>
        {/* Waveform Selector */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>Waveform</label>
          <select
            value={waveform}
            onChange={e => onWaveformChange(e.target.value as OscillatorType)}
            className={styles.select}
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>

        {/* MIDI Controls */}
        <div className={styles.controlGroup}>
          <label className={styles.label}>MIDI</label>
          {isMIDISupported ? (
            <div className={styles.midiControls}>
              <button
                className={cn(styles.button, styles.midiButton)}
                onClick={onMIDIRequest}
                disabled={isMIDIRequesting}
              >
                {isMIDIRequesting ? 'Connecting...' : 'Connect'}
              </button>
              {midiDevices.length > 0 && (
                <span className={styles.midiStatus}>
                  {midiDevices.filter(d => d.state === 'connected').length}{' '}
                  connected
                </span>
              )}
            </div>
          ) : (
            <span className={styles.midiUnsupported}>Not supported</span>
          )}
        </div>

        {/* Stop All Button */}
        <div className={styles.controlGroup}>
          <button
            className={cn(styles.button, styles.stopButton)}
            onClick={onStopAll}
            title="Stop all playing notes"
          >
            Stop All
          </button>
        </div>
      </div>
    </div>
  );
}
