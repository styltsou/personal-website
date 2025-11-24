/**
 * Settings Management
 * Handles theme, accent color, and background pattern preferences
 */

export const SETTINGS_STORAGE_KEY = 'retro-settings';

export type Theme = 'light' | 'dark';

export interface AccentColor {
  id: string;
  name: string;
  light: string; // Color value for light theme
  dark: string; // Color value for dark theme
}

export interface BackgroundPattern {
  id: string;
  name: string;
  cssValue: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { id: 'peach', name: 'Peach', light: '#ff9f7f', dark: '#ffbf9f' },
  { id: 'coral', name: 'Coral', light: '#d85a5a', dark: '#ff8a8a' },
  { id: 'sky', name: 'Sky', light: '#5a9fff', dark: '#8fc5ff' },
  { id: 'mint', name: 'Mint', light: '#4aaf6a', dark: '#9fffbf' },
  { id: 'lavender', name: 'Lavender', light: '#9f7fff', dark: '#c4aaff' },
  { id: 'rose', name: 'Rose', light: '#ff7f9f', dark: '#ffb3cf' },
  { id: 'butter', name: 'Butter', light: '#ffbf5a', dark: '#ffdf9f' },
  { id: 'turquoise', name: 'Turquoise', light: '#5fcfdf', dark: '#9fefef' },
];

export const BACKGROUND_PATTERNS: BackgroundPattern[] = [
  {
    id: 'grid',
    name: 'Grid',
    cssValue: `repeating-linear-gradient(0deg, transparent, transparent 4px, var(--desktop-pattern) 4px, var(--desktop-pattern) 6px), repeating-linear-gradient(90deg, transparent, transparent 4px, var(--desktop-pattern) 4px, var(--desktop-pattern) 6px)`,
  },
  {
    id: 'dots',
    name: 'Dots',
    cssValue: `radial-gradient(circle, var(--desktop-pattern) 1px, transparent 1px)`,
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    cssValue: `repeating-linear-gradient(45deg, transparent, transparent 8px, var(--desktop-pattern) 8px, var(--desktop-pattern) 12px)`,
  },
  {
    id: 'vertical',
    name: 'Vertical Lines',
    cssValue: `repeating-linear-gradient(90deg, transparent, transparent 4px, var(--desktop-pattern) 4px, var(--desktop-pattern) 6px)`,
  },
  {
    id: 'horizontal',
    name: 'Horizontal Lines',
    cssValue: `repeating-linear-gradient(0deg, transparent, transparent 4px, var(--desktop-pattern) 4px, var(--desktop-pattern) 6px)`,
  },
  {
    id: 'none',
    name: 'None',
    cssValue: 'none',
  },
];

export interface Settings {
  theme: Theme;
  accentColorId: string; // Accent color ID (e.g., 'coral', 'sky')
  backgroundPattern: string; // Pattern ID
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  accentColorId: ACCENT_COLORS[0].id,
  backgroundPattern: BACKGROUND_PATTERNS[0].id,
};

/**
 * Get accent color value for current theme
 */
export function getAccentColor(accentColorId: string, theme: Theme): string {
  const color = ACCENT_COLORS.find(c => c.id === accentColorId) || ACCENT_COLORS[0];
  return theme === 'dark' ? color.dark : color.light;
}

/**
 * Calculate relative luminance of a color (0-1)
 * Uses the WCAG formula for relative luminance
 */
function getLuminance(hex: string): number {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
  const b = parseInt(cleanHex.substr(4, 2), 16) / 255;

  // Convert to linear RGB
  const toLinear = (c: number) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  // Calculate relative luminance
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Get appropriate text color for an accent background
 * Returns dark text (#2a2a2a) for light colors, light text (#ffffff) for dark colors
 */
export function getAccentTextColor(accentColor: string): string {
  const luminance = getLuminance(accentColor);
  // If luminance is high (light color), use dark text; otherwise use light text
  return luminance > 0.5 ? '#2a2a2a' : '#ffffff';
}

/**
 * Get settings from localStorage or return defaults
 */
export function getSettings(): Settings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing properties
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    }

    // No saved preference, check system preference
    if (window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemSettings: Settings = {
        ...DEFAULT_SETTINGS,
        theme: prefersDark ? 'dark' : 'light',
      };
      return systemSettings;
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
}

/**
 * Apply settings to the document (CSS variables and classes)
 */
export function applySettings(settings: Settings): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  // Apply theme class
  if (settings.theme === 'dark') {
    root.classList.add('dark-theme');
  } else {
    root.classList.remove('dark-theme');
  }

  // Apply accent color based on current theme
  const accentColor = getAccentColor(settings.accentColorId, settings.theme);
  root.style.setProperty('--accent', accentColor);

  // Apply appropriate text color for accent background based on contrast
  const accentTextColor = getAccentTextColor(accentColor);
  root.style.setProperty('--titlebar-text', accentTextColor);

  // Background pattern is applied via inline styles in Desktop component
  // No need to set it here as CSS variables can't contain complex multi-line values
}

/**
 * Initialize settings on page load (before React renders)
 * This should be called in a blocking script in the HTML head
 */
export function initializeSettings(): void {
  if (typeof window === 'undefined') return;

  const settings = getSettings();
  applySettings(settings);
}

