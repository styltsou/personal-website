import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export default function ThemeToggle() {
  const settings = useStore(state => state.settings);
  const updateTheme = useStore(state => state.updateTheme);
  const [isDark, setIsDark] = useState(settings.theme === 'dark');

  // Sync with settings
  useEffect(() => {
    setIsDark(settings.theme === 'dark');
  }, [settings.theme]);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    updateTheme(newTheme);
  };

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
