/**
 * Menu Bar Component
 * Top system menu bar with window buttons, clock, date, and theme toggle
 */

import { useState, useEffect } from 'react';
import { windows } from '../data/windows';

interface MenuBarProps {
  onOpenWindow?: (windowId: string) => void;
}

const THEME_STORAGE_KEY = 'retro-theme-preference';

export default function MenuBar({ onOpenWindow }: MenuBarProps) {
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
        {windows.map((window) => (
          <button
            key={window.id}
            type="button"
            className="retro-menu-bar-button retro-focus-ring"
            onClick={() => onOpenWindow?.(window.id)}
            aria-label={`Open ${window.title} window`}
          >
            {window.title}
          </button>
        ))}
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
