/**
 * Menu Bar Component
 * Top system menu bar with window buttons, clock, date, and theme toggle
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { windows } from '../data/windows';
import type { WindowState } from '../stores/windowStore';

interface MenuBarProps {
  onOpenWindow?: (windowId: string) => void;
  onCloseWindow?: (windowId: string) => void;
  windowStates?: WindowState[];
  activeWindowId?: string | null;
}

const THEME_STORAGE_KEY = 'retro-theme-preference';

export default function MenuBar({
  onOpenWindow,
  onCloseWindow,
  windowStates = [],
  activeWindowId = null,
}: MenuBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    let shouldBeDark = false;

    if (savedTheme === 'dark' || savedTheme === 'light') {
      // Use saved preference
      shouldBeDark = savedTheme === 'dark';
    } else {
      // No saved preference, use system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      shouldBeDark = prefersDark;
    }

    setIsDark(shouldBeDark);
    // Apply theme class
    if (shouldBeDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    // Listen for system preference changes (only if no manual preference is saved)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        const newIsDark = e.matches;
        setIsDark(newIsDark);
        if (newIsDark) {
          document.documentElement.classList.add('dark-theme');
        } else {
          document.documentElement.classList.remove('dark-theme');
        }
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    // Apply theme class to document
    if (newIsDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }

    // Save preference to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, newIsDark ? 'dark' : 'light');
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="retro-menu-bar">
      <div className="retro-menu-bar-left">
        <span className="retro-menu-bar-logo">styltsou</span>
        {windows.map((window) => {
          const windowState = windowStates.find((ws) => ws.id === window.id);
          const exists = !!windowState;
          const isMinimized = windowState?.isMinimized ?? false;
          const isOpen = exists && !isMinimized; // Only consider open if not minimized
          const isActive = activeWindowId === window.id; // Active state (focused)

          // Determine button state classes - separate state from focus
          let buttonClass = 'retro-menu-bar-button retro-focus-ring';
          
          // First apply state class (open/minimized)
          if (isOpen) {
            buttonClass += ' retro-menu-bar-button-open';
          } else if (exists && isMinimized) {
            buttonClass += ' retro-menu-bar-button-minimized';
          }
          
          // Then apply focus/active class if window is focused
          if (isActive) {
            buttonClass += ' retro-menu-bar-button-focused';
          }

          return (
            <motion.button
              key={window.id}
              type="button"
              className={buttonClass}
              onClick={() => onOpenWindow?.(window.id)}
              aria-label={`${exists ? (isMinimized ? 'Minimized' : 'Open') : 'Open'} ${window.title} window${isActive ? ' (active)' : ''}`}
              initial={false}
              animate={{
                backgroundColor: isActive
                  ? 'var(--retro-focus-blue)'
                  : isOpen || (exists && isMinimized) 
                  ? 'var(--retro-button-active-bg)' 
                  : 'var(--retro-button-bg)',
                boxShadow: isOpen || (exists && isMinimized)
                  ? 'inset 1px 1px 1px var(--retro-shadow-soft)'
                  : 'none',
              }}
              transition={{
                duration: 0.03,
                ease: 'easeOut',
              }}
            >
              <AnimatePresence mode="wait">
                {exists && (
                  <motion.span
                    key="close-icon"
                    className="retro-menu-bar-button-close-icon"
                    initial={{
                      width: 0,
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      width: 12,
                      opacity: 0.7,
                      x: 0,
                    }}
                    exit={{
                      width: 0,
                      opacity: 0,
                      x: -10,
                    }}
                    transition={{
                      duration: 0.04,
                      ease: 'easeOut',
                    }}
                    exitTransition={{
                      duration: 0.04,
                      ease: 'easeIn',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (onCloseWindow) {
                        onCloseWindow(window.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Close ${window.title} window`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onCloseWindow) {
                          onCloseWindow(window.id);
                        }
                      }
                    }}
                  >
                    ×
                  </motion.span>
                )}
              </AnimatePresence>
              <span>{window.title}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="retro-menu-bar-right">
        <div className="retro-menu-bar-time">
          <span className="retro-menu-bar-date">{formatDate(currentTime)}</span>
          <span className="retro-menu-bar-clock">
            {formatTime(currentTime)}
          </span>
        </div>
        <button
          type="button"
          className="retro-menu-bar-theme-toggle retro-focus-ring"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          {isDark ? '☀' : '☾'}
        </button>
      </div>
    </div>
  );
}
