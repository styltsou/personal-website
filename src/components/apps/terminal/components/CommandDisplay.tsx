/**
 * Command Display Component
 * Renders commands with proper color coding: command name (green/red) and args (neutral)
 */

import { isValidCommand } from '../utils';
import styles from '../styles.module.scss';

interface CommandDisplayProps {
  command: string;
}

export function CommandDisplay({ command }: CommandDisplayProps) {
  const trimmedCommand = command.trim();
  if (!trimmedCommand) {
    return <span>{command}</span>;
  }

  // Split command into parts: first word is command, rest are args
  const parts = trimmedCommand.split(/\s+/);
  const commandName = parts[0] || '';
  const args = parts.slice(1).join(' ');

  const isValid = isValidCommand(trimmedCommand);

  return (
    <>
      <span
        className={styles.commandName}
        data-valid={isValid ? 'true' : 'false'}
      >
        {commandName}
      </span>
      {args && (
        <>
          {' '}
          <span className={styles.commandArgs}>{args}</span>
        </>
      )}
    </>
  );
}

