/**
 * Hook for command execution
 */

import { useCallback } from 'react';
import type { TerminalLine } from '../types';
import { executeCommand } from '../commands/handlers';
import type { CommandContext } from '../commands/handlers';

export function useCommandExecution(
  currentDirectory: string,
  setCurrentDirectory: (dir: string) => void,
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>,
  closeWindow: (windowId: string) => void,
  addToHistory: (command: string) => void
) {
  const handleExecuteCommand = useCallback(
    (command: string) => {
      const trimmedCommand = command.trim();
      if (!trimmedCommand) return;

      // Add command to history
      addToHistory(trimmedCommand);

      // Add command line to output (store the directory at execution time)
      setLines(prev => [
        ...prev,
        { 
          type: 'command', 
          content: trimmedCommand, 
          timestamp: new Date(),
          directory: currentDirectory 
        },
      ]);

      // Execute command
      const context: CommandContext = {
        currentDirectory,
        setCurrentDirectory,
        setLines,
        closeWindow,
      };

      executeCommand(trimmedCommand, context);
    },
    [currentDirectory, setCurrentDirectory, setLines, closeWindow, addToHistory]
  );

  return { handleExecuteCommand };
}

