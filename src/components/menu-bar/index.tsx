/**
 * Menu Bar Component
 * Top system menu bar with window buttons, clock, date, and theme toggle
 */

import { useState, useEffect, useMemo } from 'react';

import ThemeToggle from './theme-toggle';

import { apps } from '@/app-config';
import { useStore } from '@/store';
import { formatDate, formatTime } from '@/utils/date-time';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export default function MenuBar() {
  const windows = useStore((state) => state.windows);
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
    const windowState = windows.find((window) => window.id === windowId);
    const exists = !!windowState;
    const isMinimized = windowState?.isMinimized ?? false;
    const isOpen = exists && !isMinimized;
    const isActive = activeWindowId === windowId;
    const hasState = exists && (isOpen || isMinimized);

    return { exists, isMinimized, isOpen, isActive, hasState };
  };

  const getButtonClasses = (state: ReturnType<typeof getWindowButtonState>) => {
    return cn(
      styles.menuBarButton,
      'focus-ring',
      state.isOpen && styles.menuBarButtonOpen,
      state.exists && state.isMinimized && styles.menuBarButtonMinimized,
      state.isActive && styles.menuBarButtonFocused,
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

  // Show pinned windows (even when closed) and open windows
  // Use windows array order - most recently opened appears at the end (since we append to array)
  const menuBarWindows = useMemo(() => {
    // Get all apps that are either pinned or currently open
    const pinnedApps = apps.filter((app) => {
      const windowState = windows.find((w) => w.id === app.id);
      // Show if pinned in config OR pinned in state (for dynamic pinning)
      return (app.pinned ?? false) || windowState?.isPinned;
    });
    
    const openApps = windows
      .map((windowState) => {
        return apps.find((app) => app.id === windowState.id);
      })
      .filter((app): app is NonNullable<typeof app> => app !== undefined);

    // Combine: pinned apps first (in app config order), then open apps (in windows array order)
    // Remove duplicates (if a pinned app is also open, it appears in openApps)
    const pinnedIds = new Set(pinnedApps.map((app) => app.id));
    const openAppsNotPinned = openApps.filter((app) => !pinnedIds.has(app.id));
    
    return [...pinnedApps, ...openAppsNotPinned];
  }, [windows]);

  return (
    <div className={styles.menuBar}>
      <div className={styles.menuBarLeft}>
        <span className={styles.menuBarLogo}>styltsou</span>
        {menuBarWindows.map((window) => {
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
                    className={styles.menuBarButtonCloseIcon}
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
      <div className={styles.menuBarRight}>
        <div className={styles.menuBarTime}>
          <span className={styles.menuBarDate}>{formatDate(currentTime)}</span>
          <span className={styles.menuBarClock}>
            {formatTime(currentTime)}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
