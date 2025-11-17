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
  const windows = useStore(state => state.windows);
  const activeWindowId = useStore(state => state.activeWindowId);
  const openWindow = useStore(state => state.openWindow);
  const focusWindow = useStore(state => state.focusWindow);
  const closeWindow = useStore(state => state.closeWindow);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const getWindowButtonState = (windowId: string) => {
    const windowState = windows.find(window => window.id === windowId);
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
    const pinnedApps = apps.filter(app => {
      if (app.type !== 'app') return false;
      const windowState = windows.find(w => w.id === app.id);
      // Show if pinned in config OR pinned in state (for dynamic pinning)
      return (app.pinned ?? false) || windowState?.isPinned;
    });

    // Get open windows - both app windows and file windows
    const openWindows = windows.map(windowState => {
      // Check if this is a direct app window (window ID matches app ID)
      const app = apps.find(a => a.type === 'app' && a.id === windowState.id);
      if (app) {
        return { type: 'app' as const, app, windowState };
      }

      // Check if this is a file window (window ID starts with app ID + '-')
      // Extract base app ID from file window IDs like "photos-me.jpg" -> "photos"
      const fileWindowMatch = windowState.id.match(/^([^-]+)-/);
      if (fileWindowMatch) {
        const baseAppId = fileWindowMatch[1];
        const baseApp = apps.find(a => a.type === 'app' && a.id === baseAppId);
        if (baseApp) {
          return { type: 'file' as const, app: baseApp, windowState };
        }
      }

      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    // Separate app windows and file windows
    const openAppWindows = openWindows
      .filter(item => item.type === 'app')
      .map(item => item.app);

    const openFileWindows = openWindows.filter(item => item.type === 'file');

    // Combine: pinned apps first (in app config order), then open app windows (in windows array order),
    // then file windows (in windows array order)
    // Remove duplicates (if a pinned app is also open, it appears in openAppWindows)
    const pinnedIds = new Set(pinnedApps.map(app => app.id));
    const openAppsNotPinned = openAppWindows.filter(app => !pinnedIds.has(app.id));

    // For file windows, create menu bar entries using the window's own config
    const fileWindowEntries = openFileWindows.map(item => ({
      id: item.windowState.id,
      title: item.windowState.config.title,
      windowState: item.windowState,
    }));

    return [
      ...pinnedApps,
      ...openAppsNotPinned,
      ...fileWindowEntries,
    ];
  }, [windows]);

  return (
    <div className={styles.menuBar}>
      <div className={styles.menuBarLeft}>
        <span className={styles.menuBarLogo}>styltsou</span>
        {menuBarWindows.map(window => {
          const state = getWindowButtonState(window.id);
          // Check if this is a file window (has windowState property) or an app window
          const isFileWindow = 'windowState' in window;
          
          const handleClick = () => {
            if (isFileWindow || state.exists) {
              // Window already exists (file window or open app window) - focus it
              focusWindow(window.id);
            } else {
              // App window not yet open - open it
              openWindow(window.id);
            }
          };

          return (
            <button
              key={window.id}
              type="button"
              className={cn(getButtonClasses(state), styles.button)}
              onClick={handleClick}
              aria-label={getAriaLabel(window.title, state)}
            >
              {state.exists && (
                <span
                  className={styles.menuBarButtonCloseIcon}
                  onClick={e => handleCloseClick(window.id, e)}
                  onKeyDown={e => handleCloseKeyDown(window.id, e)}
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
          <span className={styles.menuBarClock}>{formatTime(currentTime)}</span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
