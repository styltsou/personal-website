/**
 * Hook to manage terminal state persistence in sessionStorage
 * Persists terminal state and clears it when terminal closes
 */

import { useEffect, useRef } from 'react';
import type { TerminalLine } from '../types';

interface PersistedTerminalState {
  lines: TerminalLine[];
  currentDirectory: string;
  history: string[];
}

const STORAGE_KEY = 'terminal-state';

/**
 * Serialize TerminalLine, converting Date objects to ISO strings
 */
function serializeTerminalLine(line: TerminalLine): TerminalLine {
  return {
    ...line,
    timestamp: line.timestamp ? line.timestamp.toISOString() : undefined,
  } as TerminalLine;
}

/**
 * Deserialize TerminalLine, converting ISO strings back to Date objects
 */
function deserializeTerminalLine(line: TerminalLine): TerminalLine {
  return {
    ...line,
    timestamp: line.timestamp
      ? new Date(line.timestamp as unknown as string)
      : undefined,
  };
}

export function useTerminalPersistence(
  lines: TerminalLine[],
  currentDirectory: string,
  history: string[],
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>,
  setCurrentDirectory: (dir: string) => void,
  setHistory: (history: string[]) => void,
  isTerminalOpen: boolean
) {
  const isInitialMount = useRef(true);
  const hasLoadedFromPersistence = useRef(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (!isInitialMount.current || hasLoadedFromPersistence.current) return;

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedTerminalState = JSON.parse(saved);
        
        // Deserialize lines (convert timestamp strings back to Date objects)
        const deserializedLines = parsed.lines.map(deserializeTerminalLine);
        
        // Restore state
        setLines(deserializedLines);
        setCurrentDirectory(parsed.currentDirectory || '~');
        setHistory(parsed.history || []);
        
        hasLoadedFromPersistence.current = true;
      } else {
        hasLoadedFromPersistence.current = true;
      }
    } catch (error) {
      console.warn('Failed to load terminal state from sessionStorage:', error);
      hasLoadedFromPersistence.current = true;
    }
    
    isInitialMount.current = false;
  }, []); // Only run on mount

  // Save to sessionStorage whenever state changes (only if terminal is open)
  useEffect(() => {
    if (isInitialMount.current || !hasLoadedFromPersistence.current) return;
    
    if (isTerminalOpen) {
      try {
        // Serialize lines (convert Date objects to ISO strings)
        const serializedLines = lines.map(serializeTerminalLine);
        
        const stateToSave: PersistedTerminalState = {
          lines: serializedLines,
          currentDirectory,
          history,
        };
        
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.warn('Failed to save terminal state to sessionStorage:', error);
      }
    }
  }, [lines, currentDirectory, history, isTerminalOpen]);

  // Clear sessionStorage when terminal closes
  useEffect(() => {
    if (!isTerminalOpen && hasLoadedFromPersistence.current) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn('Failed to clear terminal state from sessionStorage:', error);
      }
    }
  }, [isTerminalOpen]);
}

