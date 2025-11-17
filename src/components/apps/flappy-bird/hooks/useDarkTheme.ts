/**
 * Custom hook to detect dark theme
 */

import { useState, useEffect } from 'react';

/**
 * Detects and tracks dark theme state based on dark-theme class
 * Only checks for dark-theme class, not system preference
 */
export function useDarkTheme(): boolean {
  // Initialize synchronously to prevent flash
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      document.documentElement.classList.contains('dark-theme') ||
      document.body.classList.contains('dark-theme')
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDarkTheme = () => {
      // Only check for dark-theme class, not system preference
      // The theme toggle manages the class based on user preference
      const isDark =
        document.documentElement.classList.contains('dark-theme') ||
        document.body.classList.contains('dark-theme');
      setIsDarkTheme(isDark);
    };

    // Check immediately in case theme changed since initial render
    checkDarkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also observe body in case theme is applied there
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return isDarkTheme;
}
