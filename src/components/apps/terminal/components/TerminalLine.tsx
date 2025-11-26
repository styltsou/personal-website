/**
 * Terminal Line Component
 * Displays a single line of terminal output
 */

import type { TerminalLine as TerminalLineType } from '../types';
import { TerminalPrompt } from './TerminalPrompt';
import { DirectoryListing } from './DirectoryListing';
import { CommandDisplay } from './CommandDisplay';
import styles from '../styles.module.scss';

interface TerminalLineProps {
  line: TerminalLineType;
  currentDirectory: string;
}

export function TerminalLine({
  line,
  currentDirectory,
}: TerminalLineProps) {
  return (
    <div
      className={styles[line.type]}
      data-type={line.dataType || undefined}
    >
      {line.type === 'command' && (
        <>
          <TerminalPrompt currentDirectory={line.directory || currentDirectory} />
          <CommandDisplay command={line.content} />
        </>
      )}
      {line.type !== 'command' && (
        <>
          {line.dataType === 'directory' ? (
            <DirectoryListing
              content={line.content}
              currentDirectory={line.directory || currentDirectory}
              directoryItems={line.directoryItems}
            />
          ) : (
            line.content
          )}
        </>
      )}
    </div>
  );
}

