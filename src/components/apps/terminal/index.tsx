/**
 * Terminal Window Component
 * Terminal with command input and execution structure
 */

export { TerminalIcon } from './icon';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useStore } from '@/store';
import { getDesktopIcons } from '@/components/desktop-icons';
import styles from './styles.module.scss';

interface TerminalLine {
  type: 'output' | 'error' | 'command';
  content: string;
  timestamp?: Date;
}

// Valid commands list
const VALID_COMMANDS = ['help', 'clear', 'echo', 'exit', 'pwd', 'ls', 'cd'];

// Get colors from environment variables with fallbacks
const getValidColor = (): string => {
  try {
    // @ts-ignore - import.meta.env is available in Astro
    const color = import.meta.env?.PUBLIC_TERMINAL_VALID_COLOR;
    return color || '#7da3d1'; // Default blue
  } catch {
    return '#7da3d1'; // Default blue
  }
};

const getInvalidColor = (): string => {
  try {
    // @ts-ignore - import.meta.env is available in Astro
    const color = import.meta.env?.PUBLIC_TERMINAL_INVALID_COLOR;
    return color || '#ff4444'; // Default red
  } catch {
    return '#ff4444'; // Default red
  }
};

// Hardcoded username
const USERNAME = 'styltsou';

// Detect browser from user agent
const detectBrowser = (): string => {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'website'; // Fallback for SSR
  }

  // Check for Brave first (it has navigator.brave object)
  // @ts-ignore - navigator.brave is a Brave-specific property
  if (window.navigator.brave && typeof window.navigator.brave.isBrave === 'function') {
    return 'brave';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Edge (check before Chrome since Edge Chromium includes Chrome in UA)
  if (userAgent.includes('edg/') || userAgent.includes('edgios/')) {
    return 'edge';
  }

  // Opera (check before Chrome since Opera also includes Chrome in UA)
  if (userAgent.includes('opr/') || userAgent.includes('opera/')) {
    return 'opera';
  }

  // Chrome (after checking for Edge and Opera)
  if (userAgent.includes('chrome/')) {
    return 'chrome';
  }

  // Firefox
  if (userAgent.includes('firefox/')) {
    return 'firefox';
  }

  // Safari (check last since it also includes Chrome in UA on iOS)
  if (userAgent.includes('safari/')) {
    return 'safari';
  }

  // Fallback
  return 'website';
};

export default function TerminalWindow() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState<string>('~');
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'output', content: 'Welcome to Terminal v1.0' },
    { type: 'output', content: 'Type "help" for available commands' },
  ]);
  const [hostname, setHostname] = useState<string>('website');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const closeWindow = useStore((state) => state.closeWindow);

  // Hardcoded username
  const username = USERNAME;

  // Detect browser on mount (client-side only)
  useEffect(() => {
    const browser = detectBrowser();
    setHostname(browser);
  }, []);

  // Validate command and get color
  const getInputColor = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return 'inherit'; // Default color when input is empty
    }
    const [cmd] = trimmedInput.split(' ');
    const isValid = VALID_COMMANDS.includes(cmd.toLowerCase());
    return isValid ? getValidColor() : getInvalidColor();
  }, [input]);

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
          { type: 'output', content: '  exit - Close the terminal window' },
          { type: 'output', content: '  pwd - Print working directory' },
          { type: 'output', content: '  ls - List directory contents' },
          { type: 'output', content: '  cd <directory> - Change directory' },
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
      case 'exit':
        closeWindow('terminal');
        break;
      case 'pwd':
        setLines((prev) => [
          ...prev,
          { type: 'output', content: currentDirectory },
        ]);
        break;
      case 'cd':
        const targetDir = args[0] || '~';
        if (targetDir === '~' || targetDir === '') {
          setCurrentDirectory('~');
          break;
        }
        // Handle relative paths
        if (targetDir === '..') {
          // Go up one level
          if (currentDirectory === '~/desktop') {
            setCurrentDirectory('~');
          } else {
            setCurrentDirectory('~');
          }
          break;
        }
        // Handle ~/desktop or desktop
        if (targetDir === 'desktop' || targetDir === '~/desktop') {
          setCurrentDirectory('~/desktop');
          break;
        }
        // Check if directory exists in root
        const validRootDirs = ['about', 'contact', 'projects', 'desktop'];
        if (validRootDirs.includes(targetDir)) {
          if (targetDir === 'desktop') {
            setCurrentDirectory('~/desktop');
          } else {
            // For other root dirs, we could navigate to them, but for now just show error
            // since they're not really directories
            setLines((prev) => [
              ...prev,
              {
                type: 'error',
                content: `cd: ${targetDir}: Not a directory`,
              },
            ]);
          }
        } else if (targetDir.startsWith('~/')) {
          // Handle absolute paths starting with ~/
          const dirName = targetDir.substring(2);
          if (dirName === 'desktop') {
            setCurrentDirectory('~/desktop');
          } else {
            setLines((prev) => [
              ...prev,
              {
                type: 'error',
                content: `cd: ${targetDir}: No such file or directory`,
              },
            ]);
          }
        } else {
          setLines((prev) => [
            ...prev,
            {
              type: 'error',
              content: `cd: ${targetDir}: No such file or directory`,
            },
          ]);
        }
        break;
      case 'ls':
        // Get directory contents based on current directory
        let lsContent = '';
        if (currentDirectory === '~/desktop' || currentDirectory === 'desktop') {
          // List desktop icons
          const icons = getDesktopIcons();
          const desktopItems = icons.map((icon) => icon.label).join('  ');
          lsContent = desktopItems || 'No items found';
        } else if (currentDirectory === '~') {
          // Root directory
          lsContent = 'about  contact  desktop  projects';
        } else {
          // Other directories
          lsContent = 'No items found';
        }
        setLines((prev) => [
          ...prev,
          { type: 'output', content: lsContent },
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
  }, [closeWindow, currentDirectory]);

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

  // Get available directories for autocomplete
  const getAvailableDirectories = useCallback((): string[] => {
    if (currentDirectory === '~') {
      return ['desktop', '~', '..'];
    } else if (currentDirectory === '~/desktop') {
      return ['..', '~'];
    }
    return ['~', '..'];
  }, [currentDirectory]);

  // Helper function to find common prefix
  const findCommonPrefix = useCallback((strings: string[]): string => {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase()) && prefix.length > 0) {
        prefix = prefix.slice(0, -1);
      }
    }
    return prefix;
  }, []);

  // Handle autocomplete for cd command
  const handleAutocomplete = useCallback(() => {
    const trimmedInput = input.trim();
    const parts = trimmedInput.split(/\s+/);
    
    if (parts.length === 0 || parts[0].toLowerCase() !== 'cd') {
      return; // Only autocomplete for cd command
    }

    const partialPath = parts[1] || '';
    const availableDirs = getAvailableDirectories();
    
    // Filter directories that match the partial input (case-insensitive)
    const matches = availableDirs.filter((dir) =>
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
        setLines((prev) => [
          ...prev,
          { type: 'output', content: matches.join('  ') },
        ]);
      }
    }
  }, [input, getAvailableDirectories, findCommonPrefix]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete();
      } else if (e.key === 'ArrowUp') {
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
    [history, historyIndex, handleAutocomplete]
  );

  return (
    <div className={cn('terminal-window', styles.terminal)}>
      <div className={styles.content} ref={terminalRef}>
        {/* Output lines */}
        {lines.map((line, index) => (
          <div key={index} className={styles[line.type]}>
            {line.type === 'command' && (
              <span className={styles.prompt}>
                <span className={styles.promptUser}>{username}</span>
                <span className={styles.promptAt}>@</span>
                <span className={styles.promptHostname}>{hostname}</span>
                <span className={styles.promptSeparator}>:</span>
                <span className={styles.promptPath}>{currentDirectory}</span>
                <span className={styles.promptSymbol}>$</span>
                <span className={styles.promptPath}>~</span>{' '}
              </span>
            )}
            {line.content}
          </div>
        ))}

        {/* Input line */}
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <span className={styles.prompt}>
            <span className={styles.promptUser}>{username}</span>
            <span className={styles.promptAt}>@</span>
            <span className={styles.promptHostname}>{hostname}</span>
            <span className={styles.promptSeparator}>:</span>
            <span className={styles.promptPath}>{currentDirectory}</span>
            <span className={styles.promptSymbol}>$</span>
            <span className={styles.promptPath}>~</span>{' '}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.input}
            style={{ color: getInputColor() }}
            autoFocus
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
}
