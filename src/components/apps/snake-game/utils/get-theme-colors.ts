/**
 * Get theme colors from CSS variables
 * This allows the canvas to use the same colors as the rest of the website
 */

export function getThemeColors(isDarkTheme: boolean): {
  background: string;
  grid: string;
  text: string;
  cardBackground: string;
  cardBorder: string;
  accent: string;
  snake: string;
  snakeHead: string;
  food: string;
} {
  if (typeof window === 'undefined') {
    // Fallback for SSR
    const accent = '#f09c7c';
    return {
      background: isDarkTheme ? '#000000' : '#f8f5ed',
      grid: isDarkTheme ? '#1a1a1a' : '#eaddcf',
      text: isDarkTheme ? '#d0d0d0' : '#2a2a2a',
      cardBackground: isDarkTheme ? '#1a1a1a' : '#f8f5ed',
      cardBorder: isDarkTheme ? '#2a2a2a' : '#eaddcf',
      accent,
      snake: accent, // Use accent color for snake
      snakeHead: isDarkTheme ? '#d87a5a' : '#d87a5a', // Darker shade for head
      food: accent, // Same accent color for food
    };
  }

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const accent = computedStyle.getPropertyValue('--accent').trim() || '#f09c7c';

  // Helper to darken a hex color
  const darkenColor = (color: string, amount: number): string => {
    // Simple darkening by reducing RGB values
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  if (isDarkTheme) {
    return {
      background: '#000000', // Pure black for dark mode game
      grid: computedStyle.getPropertyValue('--window-bg').trim() || '#1a1a1a',
      text: computedStyle.getPropertyValue('--text').trim() || '#d0d0d0',
      cardBackground: computedStyle.getPropertyValue('--window-bg').trim() || '#1a1a1a',
      cardBorder: computedStyle.getPropertyValue('--window-border-light').trim() || '#2a2a2a',
      accent,
      snake: accent, // Use accent color for snake
      snakeHead: darkenColor(accent, 30), // Darker shade for head
      food: accent, // Same accent color for food
    };
  }

  return {
    background: computedStyle.getPropertyValue('--window-bg').trim() || '#f8f5ed',
    grid: computedStyle.getPropertyValue('--bg').trim() || '#eaddcf',
    text: computedStyle.getPropertyValue('--text').trim() || '#2a2a2a',
    cardBackground: computedStyle.getPropertyValue('--window-bg').trim() || '#f8f5ed',
    cardBorder: computedStyle.getPropertyValue('--window-border-dark').trim() || '#d4c4b0',
    accent,
    snake: accent, // Use accent color for snake
    snakeHead: darkenColor(accent, 30), // Darker shade for head
    food: accent, // Same accent color for food
  };
}

