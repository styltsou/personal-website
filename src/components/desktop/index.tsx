/**
 * Desktop Component
 * Main React island managing the desktop environment and window stack
 * Handles window management, URL synchronization, and sessionStorage persistence
 */

import { useEffect, useRef } from 'react';
import Window from '../window';
import MenuBar from '../menu-bar';
import DesktopIcons from '../desktop-icons';
import DraggingIcon from '../desktop-icons/dragging-icon';
import LoadingScreen from '../loading-screen';
import { MusicPlayerProvider, useMusicPlayer } from '../apps/music-player';
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
  const windowStates = useStore((state) => state.windowStates);
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
    windowStates.forEach((ws) => {
      // Skip windows with custom components (no path means they use custom React components)
      if (!ws.config.path) return;

      if (!ws.content && !isLoading(ws.id)) {
        loadWindowContent(ws.id).then((content) => {
          if (content) {
            updateWindowContent(ws.id, content);
          }
        });
      }
    });
  }, [windowStates, loadWindowContent, isLoading, updateWindowContent]);

  // Update URL when active window changes
  const activeWindowId = useStore((state) => state.activeWindowId);
  useEffect(() => {
    updateURL(activeWindowId);
  }, [activeWindowId, updateURL]);

  // Component to handle music player window close
  function MusicPlayerWindowWatcher() {
    const windowStates = useStore((state) => state.windowStates);
    const { pause, isPlaying } = useMusicPlayer();
    const previousWindowExistsRef = useRef<boolean | null>(null);

    useEffect(() => {
      const musicPlayerWindowExists = windowStates.some(
        (ws) => ws.id === 'music-player'
      );

      // Initialize ref on first render
      if (previousWindowExistsRef.current === null) {
        previousWindowExistsRef.current = musicPlayerWindowExists;
        return;
      }

      // If window was open and now it's closed, stop the player
      if (
        previousWindowExistsRef.current &&
        !musicPlayerWindowExists &&
        isPlaying
      ) {
        pause();
      }

      previousWindowExistsRef.current = musicPlayerWindowExists;
    }, [windowStates, pause, isPlaying]);

    return null;
  }

  return (
    <MusicPlayerProvider>
      <MusicPlayerWindowWatcher />
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
        {windowStates
          .filter((ws) => !ws.isMinimized)
          .map((windowState) => (
            <Window
              key={windowState.id}
              id={windowState.id}
              isLoading={isLoading}
            />
          ))}
      </div>
    </MusicPlayerProvider>
  );
}
