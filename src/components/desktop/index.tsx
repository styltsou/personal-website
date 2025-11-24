/**
 * Desktop Component
 * Main React island managing the desktop environment and window stack
 * Handles window management, URL synchronization, and sessionStorage persistence
 */

import { useEffect } from 'react';
import Window from '../window';
import Taskbar from '../taskbar';
import DesktopIcons from '../desktop-icons';
import DraggingIcon from '../desktop-icons/dragging-icon';
import LoadingScreen from '../loading-screen';
import { useStore } from '@/store';
import { useWindowContent } from '@/hooks/use-window-content';
import { useWindowPersistence } from '@/hooks/use-window-persistence';
import { useIconPersistence } from '@/hooks/use-icon-persistence';
import { useSettingsPersistence } from '@/hooks/use-settings-persistence';
import { useURLSync } from '@/hooks/use-url-sync';
import { BACKGROUND_PATTERNS } from '@/utils/settings';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export default function Desktop() {
  const { loadWindowContent, isLoading } = useWindowContent();
  const settings = useStore(state => state.settings);

  // Zustand store - clean and simple!
  const windows = useStore(state => state.windows);
  const hasLoadedFromPersistence = useStore(
    state => state.hasLoadedFromPersistence
  );

  // Get background pattern CSS
  const backgroundPattern = BACKGROUND_PATTERNS.find(
    p => p.id === settings.backgroundPattern
  ) || BACKGROUND_PATTERNS[0];

  // Determine background size based on pattern type
  const backgroundSize =
    backgroundPattern.id === 'dots' ? '12px 12px' : 'auto';

  // Only need updateWindowContent for content loading
  const updateWindowContent = useStore(state => state.updateWindowContent);

  // Handle URL synchronization
  const { updateURL } = useURLSync();

  // Handle persistence
  useWindowPersistence();
  useIconPersistence();
  useSettingsPersistence();

  // Load content for newly opened windows (skip windows with custom components - those with empty path)
  useEffect(() => {
    windows.forEach(window => {
      // Skip windows with custom components (no path means they use custom React components)
      if (!window.config.path) return;

      if (!window.content && !isLoading(window.id)) {
        loadWindowContent(window.id).then(content => {
          if (content) {
            updateWindowContent(window.id, content);
          }
        });
      }
    });
  }, [windows, loadWindowContent, isLoading, updateWindowContent]);

  // Update URL when active window changes
  const activeWindowId = useStore(state => state.activeWindowId);
  useEffect(() => {
    updateURL(activeWindowId);
  }, [activeWindowId, updateURL]);

  return (
    <>
      <LoadingScreen />
      <div
        className={cn(
          styles.desktop,
          hasLoadedFromPersistence && styles.loaded
        )}
        style={{
          backgroundImage: backgroundPattern.cssValue,
          backgroundSize: backgroundSize,
        }}
      >
        <Taskbar />
        <DesktopIcons />
        <DraggingIcon />
        {/* Render windows - keep mounted when minimized only if keepMountedWhenMinimized is true (default: false) */}
        {windows.map(windowState => {
          // Default to false: if not minimized, always render; if minimized, only render if explicitly set to true
          const shouldKeepMounted =
            !windowState.isMinimized ||
            windowState.config.keepMountedWhenMinimized === true;

          if (!shouldKeepMounted) return null;

          return (
            <Window
              key={windowState.id}
              id={windowState.id}
              isLoading={isLoading}
            />
          );
        })}
      </div>
    </>
  );
}
