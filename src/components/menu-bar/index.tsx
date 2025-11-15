/**
 * Menu Bar Component
 * Top system menu bar with window buttons, clock, date, and theme toggle
 */

import { useState, useEffect } from 'react';

import ThemeToggle from './theme-toggle';

import { apps } from '@/app-config';
import { useStore } from '@/store';
import { formatDate, formatTime } from '@/utils/date-time';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export default function MenuBar() {
  const windowStates = useStore((state) => state.windowStates);
  const activeWindowId = useStore((state) => state.activeWindowId);
  const openWindow = useStore((state) => state.openWindow);
  const closeWindow = useStore((state) => state.closeWindow);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const getWindowButtonState = (windowId: string) => {
    const windowState = windowStates.find((ws) => ws.id === windowId);
    const exists = !!windowState;
    const isMinimized = windowState?.isMinimized ?? false;
    const isOpen = exists && !isMinimized;
    const isActive = activeWindowId === windowId;
    const hasState = exists && (isOpen || isMinimized);

    return { exists, isMinimized, isOpen, isActive, hasState };
  };

  const getButtonClasses = (state: ReturnType<typeof getWindowButtonState>) => {
    return cn(
      'menu-bar-button',
      'focus-ring',
      state.isOpen && 'menu-bar-button-open',
      state.exists && state.isMinimized && 'menu-bar-button-minimized',
      state.isActive && 'menu-bar-button-focused',
      state.isActive && styles.active,
      state.hasState && !state.isActive && styles.hasState
    );
  };

  const getAriaLabel = (
    windowTitle: string,
    state: ReturnType<typeof getWindowButtonState>
  ) => {
    const status = state.exists
      ? state.isMinimized
        ? 'Minimized'
        : 'Open'
      : 'Open';
    return `${status} ${windowTitle} window${state.isActive ? ' (active)' : ''}`;
  };

  const handleCloseClick = (windowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    closeWindow(windowId);
  };

  const handleCloseKeyDown = (windowId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      closeWindow(windowId);
    }
  };

  return (
    <div className="menu-bar">
      <div className="menu-bar-left">
        <span className="menu-bar-logo">styltsou</span>
        {apps
          .filter((window) => {
            // Show pinned windows always, or unpinned windows only if they exist (are open)
            return (
              window.pinned === true ||
              windowStates.some((ws) => ws.id === window.id)
            );
          })
          .map((window) => {
            const state = getWindowButtonState(window.id);

            return (
              <button
                key={window.id}
                type="button"
                className={cn(getButtonClasses(state), styles.button)}
                onClick={() => openWindow(window.id)}
                aria-label={getAriaLabel(window.title, state)}
              >
                {state.exists && (
                  <span
                    className="menu-bar-button-close-icon"
                    onClick={(e) => handleCloseClick(window.id, e)}
                    onKeyDown={(e) => handleCloseKeyDown(window.id, e)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Close ${window.title} window`}
                  >
                    ×
                  </span>
                )}
                <span>{window.title}</span>
              </button>
            );
          })}
      </div>
      <div className="menu-bar-right">
        <div className="menu-bar-time">
          <span className="menu-bar-date">{formatDate(currentTime)}</span>
          <span className="menu-bar-clock">
            {formatTime(currentTime)}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
