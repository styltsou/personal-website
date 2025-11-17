/**
 * Desktop Component
 * Main React island managing the desktop environment and window stack
 * Handles window management, URL synchronization, and sessionStorage persistence
 */

import { useEffect } from 'react';
import Window from '../window';
import MenuBar from '../menu-bar';
import DesktopIcons from '../desktop-icons';
import DraggingIcon from '../desktop-icons/dragging-icon';
import LoadingScreen from '../loading-screen';
import { useStore } from '@/store';
import { useWindowContent } from '@/hooks/use-window-content';
import { useWindowPersistence } from '@/hooks/use-window-persistence';
import { useIconPersistence } from '@/hooks/use-icon-persistence';
import { useURLSync } from '@/hooks/use-url-sync';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export default function Desktop() {
  const { loadWindowContent, isLoading } = useWindowContent();

  // Zustand store - clean and simple!
  const windows = useStore((state) => state.windows);
  const hasLoadedFromPersistence = useStore(
    (state) => state.hasLoadedFromPersistence
  );

  // Only need updateWindowContent for content loading
  const updateWindowContent = useStore((state) => state.updateWindowContent);

  // Handle URL synchronization
  const { updateURL } = useURLSync();

  // Handle persistence
  useWindowPersistence();
  useIconPersistence();

  // Load content for newly opened windows (skip windows with custom components - those with empty path)
  useEffect(() => {
    windows.forEach((window) => {
      // Skip windows with custom components (no path means they use custom React components)
      if (!window.config.path) return;

      if (!window.content && !isLoading(window.id)) {
        loadWindowContent(window.id).then((content) => {
          if (content) {
            updateWindowContent(window.id, content);
          }
        });
      }
    });
  }, [windows, loadWindowContent, isLoading, updateWindowContent]);

  // Update URL when active window changes
  const activeWindowId = useStore((state) => state.activeWindowId);
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
      >
        <MenuBar />
        <DesktopIcons />
        <DraggingIcon />
        {/* Render all open windows */}
        {windows
          .filter((window) => !window.isMinimized)
          .map((windowState) => (
            <Window
              key={windowState.id}
              id={windowState.id}
              isLoading={isLoading}
            />
          ))}
      </div>
    </>
  );
}
