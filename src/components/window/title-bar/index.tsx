/**
 * Title Bar Component
 * Window title bar with drag functionality and controls
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { useStore } from '@/store';
import styles from './styles.module.scss';

export interface TitleBarProps {
  id: string;
  title: string;
  isDragging?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function TitleBar({
  id,
  title,
  isDragging = false,
  onMouseDown,
}: TitleBarProps) {
  // Get window state and actions directly from store
  const windowState = useStore(state =>
    state.windows.find(window => window.id === id)
  );
  const isMaximized = windowState?.isMaximized ?? false;
  const closeWindow = useStore(state => state.closeWindow);
  const minimizeWindow = useStore(state => state.minimizeWindow);
  const maximizeWindow = useStore(state => state.maximizeWindow);
  const focusWindow = useStore(state => state.focusWindow);

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Don't maximize/restore if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.titlebar-controls')) {
      return;
    }

    // Toggle maximize/restore
    maximizeWindow(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      focusWindow(id);
    }
    if (e.key === 'Escape') {
      closeWindow(id);
    }
  };

  return (
    <div
      className={cn('titlebar', styles.titleBar, isDragging && styles.dragging)}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${title} window title bar`}
    >
      <span id={`window-title-${id}`} className={styles.titleBarText}>
        {title}
      </span>
      <div
        className={cn('titlebar-controls', styles.titleBarControls)}
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Minimize Button */}
        <button
          type="button"
          className={styles.windowControl}
          onClick={e => {
            e.stopPropagation();
            minimizeWindow(id);
          }}
          aria-label={`Minimize ${title} window`}
        >
          _
        </button>
        {/* Maximize/Restore Button */}
        <button
          type="button"
          className={styles.windowControl}
          onClick={e => {
            e.stopPropagation();
            maximizeWindow(id);
          }}
          aria-label={`${isMaximized ? 'Restore' : 'Maximize'} ${title} window`}
        >
          {isMaximized ? '❐' : '□'}
        </button>
        {/* Close Button */}
        <button
          type="button"
          className={styles.windowControl}
          onClick={e => {
            e.stopPropagation();
            closeWindow(id);
          }}
          aria-label={`Close ${title} window`}
        >
          ×
        </button>
      </div>
    </div>
  );
}
