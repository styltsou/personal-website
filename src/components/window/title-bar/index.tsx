/**
 * Title Bar Component
 * Window title bar with drag functionality and controls
 */

import React from 'react';
import { cn } from '@/utils/cn';
import WindowControls from './window-controls';
import styles from './styles.module.scss';

export interface TitleBarProps {
  id: string;
  title: string;
  isMaximized: boolean;
  // position: { x: number; y: number };
  isDragging?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  // onFocus?: () => void;
  // onPositionChange?: (position: { x: number; y: number }) => void;
}

export default function TitleBar({
  id,
  title,
  isMaximized,
  // position,
  isDragging = false,
  onMouseDown,
  onKeyDown,
  onMinimize,
  onMaximize,
  onClose,
  // onFocus,
  // onPositionChange,
}: TitleBarProps) {
  const handleDoubleClick = (e: React.MouseEvent) => {
    // Don't maximize/restore if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.titlebar-controls')) {
      return;
    }

    // Toggle maximize/restore
    if (onMaximize) {
      onMaximize();
    }
  };

  return (
    <div
      className={cn('titlebar', styles.titleBar, isDragging && styles.dragging)}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${title} window title bar`}
    >
      <span id={`window-title-${id}`} className={styles.titleBarText}>
        {title}
      </span>
      <WindowControls
        title={title}
        isMaximized={isMaximized}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    </div>
  );
}
