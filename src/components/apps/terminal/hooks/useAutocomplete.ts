/**
 * Hook for terminal autocomplete
 */

import { useCallback } from 'react';
import type { TerminalLine } from '../types';
import { findCommonPrefix } from '../utils';

export function useAutocomplete(
  input: string,
  setInput: (value: string) => void,
  currentDirectory: string,
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>
) {
  const getAvailableDirectories = useCallback((): string[] => {
    if (currentDirectory === '~') {
      return ['desktop', '~', '..'];
    } else if (currentDirectory === '~/desktop') {
      return ['..', '~'];
    }
    return ['~', '..'];
  }, [currentDirectory]);

  const handleAutocomplete = useCallback(() => {
    const trimmedInput = input.trim();
    const parts = trimmedInput.split(/\s+/);

    if (parts.length === 0 || parts[0].toLowerCase() !== 'cd') {
      return; // Only autocomplete for cd command
    }

    const partialPath = parts[1] || '';
    const availableDirs = getAvailableDirectories();

    // Filter directories that match the partial input (case-insensitive)
    const matches = availableDirs.filter(dir =>
      dir.toLowerCase().startsWith(partialPath.toLowerCase())
    );

    if (matches.length === 0) {
      // No matches - do nothing (beep behavior would go here)
      return;
    } else if (matches.length === 1) {
      // Single match - complete it
      const match = matches[0];
      setInput(`cd ${match}`);
    } else {
      // Multiple matches - find common prefix first
      const commonPrefix = findCommonPrefix(matches);
      if (commonPrefix.length > partialPath.length) {
        // Complete up to common prefix
        setInput(`cd ${commonPrefix}`);
      } else {
        // Show all matches to user
        setLines(prev => [
          ...prev,
          { type: 'output', content: matches.join('  ') },
        ]);
      }
    }
  }, [input, getAvailableDirectories, setInput, setLines]);

  return { handleAutocomplete };
}

