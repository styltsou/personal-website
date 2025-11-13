/**
 * Window Component
 * Draggable, resizable window with 90s OS aesthetic
 * Uses custom hooks for drag and resize functionality
 */

import { useEffect, useRef } from 'react';
import React from 'react';
import { MENU_BAR_HEIGHT, getSnappedPreview } from '../../utils/window-utils';
import { useWindowDrag } from '../../hooks/use-window-drag';
import { useWindowResize } from '../../hooks/use-window-resize';
import { useIconStore } from '../../stores/icon-store';
import type { SnapSide, WindowState } from '../../stores/window-store';
import type { ResizeConstraint } from '@/data/apps';
import { cn } from '../../utils/cn';
import TitleBar from '../title-bar';
import ResizeHandles from '../resize-handles';
import LoadingProgressBar from '../loading-progress-bar';
import styles from './styles.module.scss';

export interface WindowProps {
  id: string;
  title: string;
  windowState: WindowState;
  isLoading: (windowId: string) => boolean;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  snapSide?: SnapSide;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onSnap?: (snapSide: SnapSide) => void;
  onUnsnap?: () => void;
  zIndex: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
  isActive?: boolean;
  hideOverflow?: boolean;
  resizeConstraint?: ResizeConstraint;
}

export default function Window({
  id,
  title,
  windowState,
  isLoading,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 900, height: 700 },
  snapSide = null,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
  onSnap,
  onUnsnap,
  zIndex,
  isMinimized = false,
  isMaximized = false,
  isActive = false,
  hideOverflow = false,
  resizeConstraint = 'none',
}: WindowProps) {
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
    onFocus,
    onPositionChange,
    onSizeChange,
    onSnap,
    onUnsnap,
    onMaximize,
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
    onFocus,
    onSizeChange,
    // Pass function to get current drag position so resize can sync with it
    getCurrentPosition: () => dragPosition,
    // Pass onPositionChange so resize can update drag position when left/top edges are used
    onPositionChange,
  });

  // Use resize position when resizing (it may update position for left/top edges)
  // Otherwise use drag position
  const position = isResizing ? resizePosition : dragPosition;

  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.style.zIndex = String(zIndex);
    }
  }, [zIndex]);

  const deselectIcons = useIconStore((state) => state.deselectIcons);

  const handleWindowClick = () => {
    deselectIcons();
    if (onFocus) {
      onFocus();
    }
  };

  // Handle keyboard accessibility for title bar
  const handleTitleBarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFocus?.();
    }
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  if (isMinimized) return null;

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
      windowHeight = window.innerHeight - MENU_BAR_HEIGHT;
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
      displayPosition = { x: 0, y: MENU_BAR_HEIGHT };
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
          isResizing && styles.resizing
        )}
        style={{
          left: `${displayPosition.x}px`,
          top: `${displayPosition.y}px`,
          zIndex: zIndex,
          width: `${windowWidth}px`,
          height: `${windowHeight}px`,
          userSelect: isDragging || isResizing ? 'none' : 'auto',
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
          position={position}
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onKeyDown={handleTitleBarKeyDown}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
          onFocus={onFocus}
          onPositionChange={onPositionChange}
        />
        {/* Loading Progress Bar - shown at top when loading */}
        {isWindowLoading && <LoadingProgressBar />}
        {/* Window Content */}
        <div
          className={cn(
            'window-content',
            styles.content,
            hideOverflow && styles.noOverflow
          )}
        >
          {(() => {
            // Try to get custom component from config first
            if (windowState.config.component) {
              return React.createElement(windowState.config.component);
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

            // Show no content message if not loading
            if (!isLoading(windowState.id)) {
              return (
                <div className={styles.noContent}>
                  <p>No content available</p>
                </div>
              );
            }

            return null;
          })()}
        </div>
        {/* Resize Handles - only show when not maximized */}
        {!isMaximized && (
          <ResizeHandles
            onResizeStart={handleResizeStart}
            constraint={resizeConstraint}
          />
        )}
      </div>
    </>
  );
}
