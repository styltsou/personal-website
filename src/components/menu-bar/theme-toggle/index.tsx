import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'retro-theme-preference';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

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

  // Sync with pre-initialized theme (theme is already set by blocking script in head)
  useEffect(() => {
    // Read current theme state from DOM (already set by blocking script)
    const isCurrentlyDark = document.documentElement.classList.contains('dark-theme');
    setIsDark(isCurrentlyDark);

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

  return (
    <button
      type="button"
      className="menu-bar-theme-toggle focus-ring"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
