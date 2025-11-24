/**
 * Settings Popover Component
 * Provides UI for changing theme, accent color, and background pattern
 */

import * as Popover from '@radix-ui/react-popover';
import { useStore } from '@/store';
import { ACCENT_COLORS, BACKGROUND_PATTERNS } from '@/utils/settings';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export default function Settings() {
  const settings = useStore(state => state.settings);
  const updateTheme = useStore(state => state.updateTheme);
  const updateAccentColor = useStore(state => state.updateAccentColor);
  const updateBackgroundPattern = useStore(state => state.updateBackgroundPattern);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={styles.settingsButton}
          aria-label="Open settings"
        >
          ⚙
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={styles.popover}
          sideOffset={8}
          align="end"
        >
          <div className={styles.popoverHeader}>
            <h3 className={styles.popoverTitle}>Settings</h3>
          </div>
          <div className={styles.popoverContent}>
            {/* Theme Selection */}
            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>Theme</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={settings.theme === 'light'}
                    onChange={e => updateTheme(e.target.value as 'light' | 'dark')}
                    className={styles.radioInput}
                  />
                  <span>Light</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={settings.theme === 'dark'}
                    onChange={e => updateTheme(e.target.value as 'light' | 'dark')}
                    className={styles.radioInput}
                  />
                  <span>Dark</span>
                </label>
              </div>
            </div>

            {/* Accent Color Selection */}
            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>Accent Color</label>
              <div className={styles.colorGrid}>
                {ACCENT_COLORS.map(color => {
                  const isSelected = settings.accentColorId === color.id;
                  const currentColor = settings.theme === 'dark' ? color.dark : color.light;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      className={cn(
                        styles.colorSwatch,
                        isSelected && styles.selected
                      )}
                      style={{ backgroundColor: currentColor }}
                      onClick={() => updateAccentColor(color.id)}
                      aria-label={`Select ${color.name} accent color`}
                      title={color.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Background Pattern Selection */}
            <div className={styles.settingGroup}>
              <label className={styles.settingLabel}>Background Pattern</label>
              <div className={styles.patternGrid}>
                {BACKGROUND_PATTERNS.map(pattern => (
                  <button
                    key={pattern.id}
                    type="button"
                    className={cn(
                      styles.patternOption,
                      settings.backgroundPattern === pattern.id && styles.selected
                    )}
                    onClick={() => updateBackgroundPattern(pattern.id)}
                    aria-label={`Select ${pattern.name} background pattern`}
                  >
                    <div
                      className={styles.patternPreview}
                      style={{
                        backgroundImage: pattern.cssValue,
                        backgroundColor: 'var(--bg)',
                        backgroundSize: pattern.id === 'dots' ? '12px 12px' : 'auto',
                      }}
                    />
                    <span className={styles.patternName}>{pattern.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

