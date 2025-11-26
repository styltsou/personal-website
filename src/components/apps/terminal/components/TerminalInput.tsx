/**
 * Terminal Input Component
 * Handles command input with validation and history
 */

import {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import { TerminalPrompt } from './TerminalPrompt';
import { isValidCommand } from '../utils';
import styles from '../styles.module.scss';

interface TerminalInputProps {
  input: string;
  setInput: (value: string) => void;
  currentDirectory: string;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export interface TerminalInputRef {
  focus: () => void;
}

export const TerminalInput = forwardRef<TerminalInputRef, TerminalInputProps>(
  function TerminalInput(
    { input, setInput, currentDirectory, onSubmit, onKeyDown },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);

    // Expose focus method to parent
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    // Auto-focus input when terminal is opened
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    // Reset cursor position immediately when input is cleared
    useEffect(() => {
      if (input.length === 0) {
        setCursorPosition(0);
      }
    }, [input]);

    // Track focus state and cursor position
    const handleFocus = () => {
      setIsFocused(true);
      updateCursorPosition();
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      // Update cursor position synchronously
      requestAnimationFrame(() => {
        updateCursorPosition();
      });
    };

    const handleKeyDownInternal = (
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      // For Enter key, reset cursor position immediately
      if (e.key === 'Enter') {
        setCursorPosition(0);
      }
      // Update cursor position for other keys
      requestAnimationFrame(() => {
        updateCursorPosition();
      });
      onKeyDown(e);
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
      updateCursorPosition();
    };

    const handleSubmit = (e: React.FormEvent) => {
      // Reset cursor position immediately before submit
      setCursorPosition(0);
      onSubmit(e);
    };

    const updateCursorPosition = () => {
      if (inputRef.current) {
        setCursorPosition(inputRef.current.selectionStart || 0);
      }
    };

    // Parse command for display
    const trimmedCommand = input.trim();
    const parts = trimmedCommand.split(/\s+/);
    const commandName = parts[0] || '';
    const isValid = trimmedCommand ? isValidCommand(trimmedCommand) : undefined;

    // Find the first non-whitespace character to locate command start
    const firstNonWhitespaceIndex = input.search(/\S/);
    if (firstNonWhitespaceIndex === -1) {
      // Only whitespace
      return (
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <TerminalPrompt currentDirectory={currentDirectory} />
          <div className={styles.inputWrapper}>
            <div className={styles.inputOverlay}>
              {input}
              {isFocused && (
                <span
                  className={styles.blockCursor}
                  style={{ left: `${cursorPosition * 0.6}em` }}
                />
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDownInternal}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSelect={handleSelect}
              className={styles.input}
              autoFocus
              spellCheck={false}
            />
          </div>
        </form>
      );
    }

    // Find where the command name ends (first space after command or end of string)
    const commandStart = firstNonWhitespaceIndex;
    const afterCommandStart = input.substring(commandStart);
    const nextSpaceIndex = afterCommandStart.indexOf(' ');
    const commandEnd =
      nextSpaceIndex === -1 ? input.length : commandStart + nextSpaceIndex;

    const beforeCommand = input.substring(0, commandStart);
    const commandNameText = input.substring(commandStart, commandEnd);
    const afterCommand = input.substring(commandEnd);

    // Calculate cursor position in em units (monospace font)
    const cursorLeft = cursorPosition * 0.6; // 0.6em per character in monospace

    return (
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <TerminalPrompt currentDirectory={currentDirectory} />
        <div className={styles.inputWrapper}>
          {/* Colored text overlay */}
          <div className={styles.inputOverlay}>
            {beforeCommand}
            {commandNameText && (
              <span
                className={styles.commandName}
                data-valid={
                  isValid !== undefined
                    ? isValid
                      ? 'true'
                      : 'false'
                    : undefined
                }
              >
                {commandNameText}
              </span>
            )}
            {afterCommand && (
              <span className={styles.commandArgs}>{afterCommand}</span>
            )}
            {isFocused && (
              <span
                className={styles.blockCursor}
                style={{ left: `${cursorLeft}em` }}
              />
            )}
          </div>
          {/* Transparent input on top */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDownInternal}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelect={handleSelect}
            className={styles.input}
            autoFocus
            spellCheck={false}
          />
        </div>
      </form>
    );
  }
);
