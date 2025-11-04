/**
 * Terminal Window Component
 * Visual terminal window component (no actual functionality)
 */

import { cn } from '../../utils/cn';
import styles from './styles.module.scss';

export default function TerminalWindow() {
  return (
    <div className={cn('terminal-window', styles.terminal)}>
      <div className={styles.content}>
        {/* Prompt line */}
        <div className={styles.prompt}>
          <span className={styles.promptSymbol}>$</span>
          <span className={styles.promptPath}>~</span>
        </div>

        {/* Output lines */}
        <div className={styles.output}>Welcome to Terminal v1.0</div>
        <div className={styles.text}>
          Type commands here (not functional yet)
        </div>
        <div className={styles.command}>
          {'> '}
          <span className={styles.cursor}></span>
        </div>
      </div>
    </div>
  );
}
