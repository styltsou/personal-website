/**
 * Terminal Window Component
 * Terminal with command input and execution structure
 */

export { TerminalIcon } from './icon';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useStore } from '@/store';
import styles from './styles.module.scss';

// Types
import type { TerminalLine } from './types';
import type { TerminalInputRef } from './components/TerminalInput';

// Components
import { TerminalLine as TerminalLineComponent } from './components/TerminalLine';
import { TerminalInput } from './components/TerminalInput';

// Hooks
import { useTerminalHistory } from './hooks/useTerminalHistory';
import { useCommandExecution } from './hooks/useCommandExecution';
import { useAutocomplete } from './hooks/useAutocomplete';

export default function TerminalWindow() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<TerminalInputRef>(null);

  const [input, setInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState<string>('~');
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: 'output',
      content: 'Type "help" for available commands',
      dataType: 'info',
    },
  ]);

  const closeWindow = useStore(state => state.closeWindow);
  const activeWindowId = useStore(state => state.activeWindowId);

  // Hooks
  const { addToHistory, navigateHistory } = useTerminalHistory();
  const { handleExecuteCommand } = useCommandExecution(
    currentDirectory,
    setCurrentDirectory,
    setLines,
    closeWindow,
    addToHistory
  );
  const { handleAutocomplete } = useAutocomplete(
    input,
    setInput,
    currentDirectory,
    setLines
  );

  // Handle input submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleExecuteCommand(input);
      setInput('');
    },
    [input, handleExecuteCommand]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newInput = navigateHistory('up', input);
        setInput(newInput);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newInput = navigateHistory('down', input);
        setInput(newInput);
      }
    },
    [input, handleAutocomplete, navigateHistory]
  );

  // Auto-focus input when terminal window becomes active
  useEffect(() => {
    if (activeWindowId === 'terminal') {
      // Small delay to ensure the window is fully focused
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [activeWindowId]);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className={cn('terminal-window', styles.terminal)}>
      <div className={styles.content} ref={terminalRef}>
        {/* Output lines */}
        {lines.map((line, index) => (
          <TerminalLineComponent
            key={index}
            line={line}
            currentDirectory={currentDirectory}
          />
        ))}

        {/* Input line */}
        <TerminalInput
          ref={inputRef}
          input={input}
          setInput={setInput}
          currentDirectory={currentDirectory}
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
