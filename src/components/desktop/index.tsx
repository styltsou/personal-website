/**
 * Desktop Component
 * Main React island managing the desktop environment and window stack
 * Handles window management, URL synchronization, and sessionStorage persistence
 */

import { useEffect, useMemo, useRef } from 'react';
import Window from '../window';
import MenuBar from '../menu-bar';
import DesktopIcons from '../desktop-icons';
import DraggingIcon from '../dragging-icon';
import TerminalWindow from '../terminal-window';
import WikipediaWindow from '../wikipedia-window';
import FlappyBirdWindow from '../flappy-bird-window';
import PianoWindow from '../piano-window';
import {
  MusicPlayerProvider,
  MusicPlayerContent,
  useMusicPlayer,
} from '../music-player';
import { useWindowStore } from '../../stores/window-store';
import { useWindowContent } from '../../hooks/use-window-content';
import { useWindowPersistence } from '../../hooks/use-window-persistence';
import { useIconPersistence } from '../../hooks/use-icon-persistence';
import { useURLSync } from '../../hooks/use-url-sync';
import { cn } from '../../utils/cn';
import styles from './styles.module.scss';

export default function Desktop() {
  const { loadWindowContent, isLoading } = useWindowContent();

  // Zustand store - clean and simple!
  const windowStates = useWindowStore((state) => state.windowStates);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);

  // Select individual actions from store (functions are stable)
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const updateWindowPosition = useWindowStore(
    (state) => state.updateWindowPosition
  );
  const updateWindowSize = useWindowStore((state) => state.updateWindowSize);
  const updateWindowContent = useWindowStore(
    (state) => state.updateWindowContent
  );
  const snapWindow = useWindowStore((state) => state.snapWindow);
  const unsnapWindow = useWindowStore((state) => state.unsnapWindow);

  // Memoize window actions object to prevent unnecessary re-renders
  const windowActions = useMemo(
    () => ({
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      updateWindowContent,
      snapWindow,
      unsnapWindow,
    }),
    [
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      updateWindowContent,
      snapWindow,
      unsnapWindow,
    ]
  );

  // Handle URL synchronization
  const { updateURL } = useURLSync();

  // Handle persistence
  useWindowPersistence();
  useIconPersistence();

  // Load content for newly opened windows (skip terminal, wikipedia, and music-player as they have custom components)
  useEffect(() => {
    windowStates.forEach((ws) => {
      // Skip terminal, wikipedia, flappy-bird, music-player, and piano windows - they use custom components
      if (
        ws.id === 'terminal' ||
        ws.id === 'wikipedia' ||
        ws.id === 'flappy-bird' ||
        ws.id === 'music-player' ||
        ws.id === 'piano'
      )
        return;

      if (!ws.content && !isLoading(ws.id)) {
        loadWindowContent(ws.id).then((content) => {
          if (content) {
            windowActions.updateWindowContent(ws.id, content);
          }
        });
      }
    });
  }, [windowStates, loadWindowContent, isLoading]);

  // Update URL when active window changes
  useEffect(() => {
    updateURL(activeWindowId);
  }, [activeWindowId, updateURL]);

  // Component to handle music player window close
  function MusicPlayerWindowWatcher() {
    const windowStates = useWindowStore((state) => state.windowStates);
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
      <div className={cn('desktop', styles.desktop)}>
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
              title={windowState.config.title}
              initialPosition={windowState.position}
              initialSize={windowState.size}
              snapSide={windowState.snapSide}
              zIndex={windowState.zIndex}
              isMinimized={windowState.isMinimized}
              isMaximized={windowState.isMaximized}
              isActive={activeWindowId === windowState.id}
              onClose={() => windowActions.closeWindow(windowState.id)}
              onMinimize={() => windowActions.minimizeWindow(windowState.id)}
              onMaximize={() => windowActions.maximizeWindow(windowState.id)}
              onFocus={() => windowActions.focusWindow(windowState.id)}
              onPositionChange={(position) =>
                windowActions.updateWindowPosition(windowState.id, position)
              }
              onSizeChange={(size) =>
                windowActions.updateWindowSize(windowState.id, size)
              }
              onSnap={(snapSide) =>
                windowActions.snapWindow(windowState.id, snapSide)
              }
              onUnsnap={() => windowActions.unsnapWindow(windowState.id)}
              isLoading={
                windowState.id !== 'terminal' &&
                windowState.id !== 'wikipedia' &&
                windowState.id !== 'flappy-bird' &&
                windowState.id !== 'music-player' &&
                windowState.id !== 'piano' &&
                isLoading(windowState.id)
              }
              hideOverflow={windowState.id === 'wikipedia'}
              resizeConstraint={windowState.config.resizeConstraint}
            >
              {windowState.id === 'terminal' ? (
                <TerminalWindow />
              ) : windowState.id === 'wikipedia' ? (
                <WikipediaWindow />
              ) : windowState.id === 'flappy-bird' ? (
                <FlappyBirdWindow />
              ) : windowState.id === 'music-player' ? (
                <MusicPlayerContent />
              ) : windowState.id === 'piano' ? (
                <PianoWindow />
              ) : windowState.content ? (
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: windowState.content }}
                />
              ) : !isLoading(windowState.id) ? (
                <div className={styles.noContent}>
                  <p>No content available</p>
                </div>
              ) : null}
            </Window>
          ))}
      </div>
    </MusicPlayerProvider>
  );
}
