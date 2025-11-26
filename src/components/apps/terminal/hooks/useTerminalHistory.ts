/**
 * Hook to manage terminal command history
 * Persists command history in localStorage across sessions
 */

import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'terminal-command-history';
const MAX_HISTORY_SIZE = 100; // Limit history size to prevent storage bloat

/**
 * Load history from localStorage
 */
function loadHistory(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.warn('Failed to load terminal history from localStorage:', error);
  }

  return [];
}

/**
 * Save history to localStorage
 */
function saveHistory(history: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Limit history size to prevent storage bloat
    const limitedHistory = history.slice(-MAX_HISTORY_SIZE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.warn('Failed to save terminal history to localStorage:', error);
  }
}

export function useTerminalHistory() {
  // Load history from localStorage on mount
  const [history, setHistory] = useState<string[]>(() => loadHistory());
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isInitialMount = useRef(true);
  const hasLoadedFromStorage = useRef(false);

  // Ensure history is loaded from localStorage on mount
  // This handles cases where useState initializer might not work (e.g., SSR)
  useEffect(() => {
    if (!hasLoadedFromStorage.current) {
      const loaded = loadHistory();
      if (loaded.length > 0) {
        setHistory(loaded);
      }
      hasLoadedFromStorage.current = true;
    }
  }, []);

  // Save history to localStorage whenever it changes (after initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Only save if we've loaded from storage (to avoid overwriting with empty array on first render)
    if (hasLoadedFromStorage.current) {
      saveHistory(history);
    }
  }, [history]);

  const addToHistory = useCallback((command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return; // Don't save empty commands

    setHistory(prev => {
      // Remove duplicate if it exists (avoid consecutive duplicates)
      const filtered = prev.filter(cmd => cmd !== trimmedCommand);
      // Add to end
      return [...filtered, trimmedCommand];
    });
    setHistoryIndex(-1);
  }, []);

  const navigateHistory = useCallback(
    (direction: 'up' | 'down', currentInput: string) => {
      if (history.length === 0) return currentInput;

      if (direction === 'up') {
        const newIndex =
          historyIndex === -1
            ? history.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        return history[newIndex];
      } else {
        // direction === 'down'
        if (historyIndex >= 0) {
          const newIndex = Math.min(history.length - 1, historyIndex + 1);
          if (newIndex === history.length - 1) {
            setHistoryIndex(-1);
            return '';
          } else {
            setHistoryIndex(newIndex);
            return history[newIndex];
          }
        }
        return currentInput;
      }
    },
    [history, historyIndex]
  );

  return {
    history,
    historyIndex,
    addToHistory,
    navigateHistory,
  };
}
