/**
 * Terminal Window Component
 * Terminal with command input and execution structure
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import styles from './styles.module.scss';

interface TerminalLine {
  type: 'output' | 'error' | 'command';
  content: string;
  timestamp?: Date;
}

export default function TerminalWindow() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Welcome to Terminal v1.0' },
    { type: 'output', content: 'Type "help" for available commands' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when terminal is opened
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Execute a command (placeholder for future implementation)
  const executeCommand = useCallback((command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    // Add command to history
    setHistory((prev) => [...prev, trimmedCommand]);
    setHistoryIndex(-1);

    // Add command line to output
    setLines((prev) => [
      ...prev,
      { type: 'command', content: trimmedCommand, timestamp: new Date() },
    ]);

    // Parse and execute command
    const [cmd, ...args] = trimmedCommand.split(' ');

    // Placeholder command handlers
    switch (cmd.toLowerCase()) {
      case 'help':
        setLines((prev) => [
          ...prev,
          { type: 'output', content: 'Available commands:' },
          { type: 'output', content: '  help - Show this help message' },
          { type: 'output', content: '  clear - Clear the terminal' },
          { type: 'output', content: '  echo <text> - Echo text back' },
        ]);
        break;
      case 'clear':
        setLines([]);
        break;
      case 'echo':
        setLines((prev) => [
          ...prev,
          { type: 'output', content: args.join(' ') || '' },
        ]);
        break;
      default:
        setLines((prev) => [
          ...prev,
          {
            type: 'error',
            content: `Command not found: ${cmd}. Type "help" for available commands.`,
          },
        ]);
    }
  }, []);

  // Handle input submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      executeCommand(input);
      setInput('');
      inputRef.current?.focus();
    },
    [input, executeCommand]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0) {
          const newIndex =
            historyIndex === -1
              ? history.length - 1
              : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex >= 0) {
          const newIndex = Math.min(history.length - 1, historyIndex + 1);
          if (newIndex === history.length - 1) {
            setHistoryIndex(-1);
            setInput('');
          } else {
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
          }
        }
      }
    },
    [history, historyIndex]
  );

  return (
    <div className={cn('terminal-window', styles.terminal)}>
      <div className={styles.content} ref={terminalRef}>
        {/* Output lines */}
        {lines.map((line, index) => (
          <div key={index} className={styles[line.type]}>
            {line.type === 'command' && (
              <span className={styles.prompt}>
                <span className={styles.promptSymbol}>$</span>
                <span className={styles.promptPath}>~</span>
                {' '}
              </span>
            )}
            {line.content}
          </div>
        ))}

        {/* Input line */}
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <span className={styles.prompt}>
            <span className={styles.promptSymbol}>$</span>
            <span className={styles.promptPath}>~</span>
            {' '}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.input}
            autoFocus
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
}
