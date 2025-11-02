/**
 * Desktop Component
 * Main React island managing the desktop environment and window stack
 * Handles window management, URL synchronization, and sessionStorage persistence
 */

import { useEffect, useMemo } from 'react';
import Window from './window';
import MenuBar from './menu-bar';
import { useWindowStore } from '../stores/window-store';
import { useWindowContent } from '../hooks/use-window-content';
import { useWindowPersistence } from '../hooks/use-window-persistence';
import { useURLSync } from '../hooks/use-url-sync';

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

  // Load content for newly opened windows
  useEffect(() => {
    windowStates.forEach((ws) => {
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

  return (
    <div className="retro-desktop relative h-screen w-full overflow-hidden">
      {/* Top Menu Bar */}
      <MenuBar />

      {/* Desktop Icons - Hidden for cleaner look */}

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
          >
            {isLoading(windowState.id) ? (
              <div className="flex h-full items-center justify-center">
                <p>Loading...</p>
              </div>
            ) : windowState.content ? (
              <div dangerouslySetInnerHTML={{ __html: windowState.content }} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p>No content available</p>
              </div>
            )}
          </Window>
        ))}
    </div>
  );
}
