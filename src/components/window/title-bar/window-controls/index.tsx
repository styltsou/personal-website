/**
 * Window Controls Component
 * Minimize, Maximize/Restore, and Close buttons
 */

import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export interface WindowControlsProps {
  title: string;
  isMaximized: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function WindowControls({
  title,
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
}: WindowControlsProps) {
  return (
    <div
      className={cn('titlebar-controls', styles.titleBarControls)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Minimize Button */}
      {onMinimize && (
        <button
          type="button"
          className={cn(styles.windowControl, 'focus-ring')}
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          aria-label={`Minimize ${title} window`}
        >
          _
        </button>
      )}
      {/* Maximize/Restore Button */}
      {onMaximize && (
        <button
          type="button"
          className={cn(styles.windowControl, 'focus-ring')}
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          aria-label={`${isMaximized ? 'Restore' : 'Maximize'} ${title} window`}
        >
          {isMaximized ? '❐' : '□'}
        </button>
      )}
      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          className={cn(styles.windowControl, 'focus-ring')}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${title} window`}
        >
          ×
        </button>
      )}
    </div>
  );
}
