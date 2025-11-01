/**
 * Window Component
 * Draggable, resizable window with 90s OS aesthetic
 * Uses custom hooks for drag and resize functionality
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { MENU_BAR_HEIGHT } from '../utils/windowUtils';
import { useWindowDrag } from '../hooks/useWindowDrag';
import { useWindowResize } from '../hooks/useWindowResize';
import TitleBar from './TitleBar';
import ResizeHandles from './ResizeHandles';

export interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  zIndex: number;
  isMinimized?: boolean;
  isMaximized?: boolean;
  isActive?: boolean;
}

export default function Window({
  id,
  title,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 900, height: 700 },
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
  zIndex,
  isMinimized = false,
  isMaximized = false,
  isActive = false,
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);

  // Use drag hook for window dragging
  const {
    position: dragPosition,
    isDragging,
    handleMouseDown,
  } = useWindowDrag({
    initialPosition,
    initialSize,
    isMaximized,
    onFocus,
    onPositionChange,
  });

  // Use resize hook for window resizing
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
    // Don't pass onPositionChange - position is managed by drag hook
  });

  // Use resize position when resizing (it may update position for left/top edges)
  // Otherwise use drag position
  const position = isResizing ? resizePosition : dragPosition;

  // Update z-index directly in DOM when it changes
  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.style.zIndex = String(zIndex);
    }
  }, [zIndex]);

  // Handle maximized state - move below menu bar
  useEffect(() => {
    if (isMaximized && windowRef.current) {
      windowRef.current.style.left = '0px';
      windowRef.current.style.top = `${MENU_BAR_HEIGHT}px`;
    }
  }, [isMaximized]);

  // Handle focus on window click
  const handleWindowClick = () => {
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

  // Hide window if minimized (no animation)
  if (isMinimized) {
    return null;
  }

  const windowWidth = isMaximized ? window.innerWidth : size.width;
  const windowHeight = isMaximized
    ? window.innerHeight - MENU_BAR_HEIGHT
    : size.height;

  return (
    <div
      ref={windowRef}
      className={`retro-window ${isActive ? 'active' : ''} ${isDragging ? 'cursor-grabbing' : ''} ${isResizing ? 'cursor-resizing' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
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
        onMouseDown={handleMouseDown}
        onKeyDown={handleTitleBarKeyDown}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
        onFocus={onFocus}
        onPositionChange={onPositionChange}
      />

      {/* Window Content */}
      <div className="retro-window-content h-[calc(100%-32px)] overflow-auto p-6">
        {children}
      </div>

      {/* Resize Handles - only show when not maximized */}
      {!isMaximized && <ResizeHandles onResizeStart={handleResizeStart} />}
    </div>
  );
}
