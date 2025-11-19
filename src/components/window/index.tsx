/**
 * Window Component
 * Draggable, resizable window with 90s OS aesthetic
 * Uses custom hooks for drag and resize functionality
 */

import { useEffect, useRef } from 'react';
import React from 'react';
import { TASKBAR_HEIGHT } from '@/constants';
import { getSnappedPreview, getMinWindowSize } from './utils/window-utils';
import { useWindowDrag } from '@/hooks/use-window-drag';
import { useWindowResize } from '@/hooks/use-window-resize';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import TitleBar from './title-bar';
import ResizeHandles from './resize-handles';
import Loading from '@/components/ui/loading';
import styles from './styles.module.scss';

export interface WindowProps {
  id: string;
  isLoading: (windowId: string) => boolean;
}

export default function Window({ id, isLoading }: WindowProps) {
  // Get window state and actions from store
  const windowState = useStore(state =>
    state.windows.find(window => window.id === id)
  );
  const activeWindowId = useStore(state => state.activeWindowId);

  // Get actions from store
  const closeWindow = useStore(state => state.closeWindow);
  const minimizeWindow = useStore(state => state.minimizeWindow);
  const maximizeWindow = useStore(state => state.maximizeWindow);
  const focusWindow = useStore(state => state.focusWindow);
  const updateWindowPosition = useStore(state => state.updateWindowPosition);
  const updateWindowSize = useStore(state => state.updateWindowSize);
  const snapWindow = useStore(state => state.snapWindow);
  const unsnapWindow = useStore(state => state.unsnapWindow);

  // Early return if window state not found
  if (!windowState) return null;

  // Extract values from windowState
  const {
    position: initialPosition,
    size: initialSize,
    snapSide,
    zIndex,
    isMinimized,
    isMaximized,
    config,
  } = windowState;

  const title = config.title;
  const isActive = activeWindowId === id;
  const hideOverflow = id === 'wikipedia';
  const resizable = config.resizable ?? true; // Default to true if not specified
  const minSize = config.minSize ?? getMinWindowSize(); // Default to global minimum if not specified
  // Determine if window is loading (only for content-based windows)
  const isWindowLoading = windowState.config.path && isLoading(windowState.id);
  const windowRef = useRef<HTMLDivElement>(null);

  const {
    position: dragPosition,
    isDragging,
    previewSnapSide,
    handleMouseDown,
  } = useWindowDrag({
    initialPosition,
    initialSize,
    isMaximized,
    snapSide,
    onFocus: () => focusWindow(id),
    onPositionChange: position => updateWindowPosition(id, position),
    onSizeChange: size => updateWindowSize(id, size),
    onSnap: snapSide => snapWindow(id, snapSide),
    onUnsnap: () => unsnapWindow(id),
    onMaximize: () => maximizeWindow(id),
  });

  // Pass initial position so resize can sync with drag position
  const {
    size,
    position: resizePosition,
    isResizing,
    handleResizeStart,
  } = useWindowResize({
    initialSize,
    initialPosition,
    isMaximized,
    minSize, // Use defaulted minSize (either from config or global minimum)
    onFocus: () => focusWindow(id),
    onSizeChange: size => updateWindowSize(id, size),
    // Pass function to get current drag position so resize can sync with it
    getCurrentPosition: () => dragPosition,
    // Pass onPositionChange so resize can update drag position when left/top edges are used
    onPositionChange: position => updateWindowPosition(id, position),
  });

  // Use resize position when resizing (it may update position for left/top edges)
  // Otherwise use drag position
  const position = isResizing ? resizePosition : dragPosition;

  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.style.zIndex = String(zIndex);
    }
  }, [zIndex]);

  const deselectIcons = useStore(state => state.deselectIcons);

  const handleWindowClick = () => {
    deselectIcons();
    focusWindow(id);
  };

  // Handle keyboard accessibility for title bar
  const handleTitleBarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      focusWindow(id);
    }
    if (e.key === 'Escape') {
      closeWindow(id);
    }
  };

  // Calculate window size and position
  // If maximized, override display to maximized values (but keep actual position/size in store)
  // If snapped, derive snapped size/position visually (but keep actual size/position in store)
  let windowWidth: number;
  let windowHeight: number;
  let displayPosition = position;

  if (isMaximized) {
    // Override display with maximized size/position - actual position/size in store unchanged
    // Check if window is available (client-side only)
    if (typeof window !== 'undefined') {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight - TASKBAR_HEIGHT;
    } else {
      // Fallback for SSR
      windowWidth = size.width;
      windowHeight = size.height;
    }
    // During dragging, use the drag position; otherwise use maximized position
    if (isDragging) {
      // Keep maximized size but use drag position for smooth transition
      displayPosition = position; // position from drag hook
    } else {
      displayPosition = { x: 0, y: TASKBAR_HEIGHT };
    }
  } else if (snapSide) {
    // When snapped, show snapped size/position visually
    // This applies whether dragging or not - size only changes when unsnapping
    const snapped = getSnappedPreview(snapSide);
    windowWidth = snapped.size.width;
    windowHeight = snapped.size.height;
    // During dragging, use the drag position; otherwise use snapped position
    if (isDragging) {
      // Keep snapped size but use drag position for smooth transition
      displayPosition = position; // position from drag hook
    } else {
      displayPosition = snapped.position;
    }
  } else {
    // Not snapped - use actual size/position from hooks
    windowWidth = size.width;
    windowHeight = size.height;
    // displayPosition is already set to position (from drag hook)
  }

  // Calculate preview snap position/size if previewing
  const snapPreview = previewSnapSide
    ? getSnappedPreview(previewSnapSide)
    : null;

  return (
    <>
      {/* Snap Preview Overlay */}
      {isDragging && previewSnapSide && snapPreview && (
        <div
          className={styles.snapPreview}
          style={{
            left: `${snapPreview.position.x}px`,
            top: `${snapPreview.position.y}px`,
            width: `${snapPreview.size.width}px`,
            height: `${snapPreview.size.height}px`,
            zIndex: zIndex - 1,
          }}
        />
      )}
      <div
        ref={windowRef}
        className={cn(
          'window',
          styles.window,
          isActive && 'active',
          isDragging && styles.dragging,
          isResizing && styles.resizing,
          isMinimized && styles.minimized
        )}
        style={{
          left: `${displayPosition.x}px`,
          top: `${displayPosition.y}px`,
          zIndex: zIndex,
          width: `${windowWidth}px`,
          height: `${windowHeight}px`,
          userSelect: isDragging || isResizing ? 'none' : 'auto',
          display: isMinimized ? 'none' : undefined,
        }}
        onClick={handleWindowClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`window-title-${id}`}
        tabIndex={-1}
      >
        {/* Title Bar */}
        <TitleBar
          id={id}
          title={title}
          isMaximized={isMaximized}
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onKeyDown={handleTitleBarKeyDown}
          onMinimize={() => minimizeWindow(id)}
          onMaximize={() => maximizeWindow(id)}
          onClose={() => closeWindow(id)}
        />
        {/* Window Content */}
        <div className={cn(styles.content, hideOverflow && styles.noOverflow)}>
          {(() => {
            // Try to get custom component from config first
            if (windowState.config.component) {
              return React.createElement(
                windowState.config.component,
                windowState.config.props || undefined
              );
            }

            // Fall back to content-based rendering
            if (windowState.content) {
              return (
                <div
                  className={styles.htmlContent}
                  dangerouslySetInnerHTML={{ __html: windowState.content }}
                />
              );
            }

            // Show loading message while loading
            if (isWindowLoading) {
              return <Loading />;
            }

            // Show no content message if not loading
            return (
              <div className={styles.noContent}>
                <p>No content available</p>
              </div>
            );
          })()}
        </div>
        {/* Resize Handles - only show when not maximized */}
        {!isMaximized && (
          <ResizeHandles
            onResizeStart={handleResizeStart}
            resizable={resizable}
          />
        )}
      </div>
    </>
  );
}
