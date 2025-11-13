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
