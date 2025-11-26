/**
 * Terminal Prompt Component
 * Displays a minimal prompt: directory>
 */

import styles from '../styles.module.scss';
import { ChevronIcon } from './ChevronIcon';

interface TerminalPromptProps {
  currentDirectory: string;
}

export function TerminalPrompt({ currentDirectory }: TerminalPromptProps) {
  return (
    <span className={styles.prompt}>
      <span className={styles.promptPath}>{currentDirectory}</span>
      <ChevronIcon className={styles.promptSymbol} />{' '}
    </span>
  );
}
