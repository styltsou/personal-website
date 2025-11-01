/**
 * Window Component
 * Draggable, resizable window with 90s OS aesthetic
 * Uses native drag handling for better z-index control
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { MENU_BAR_HEIGHT, getMinWindowSize } from '../utils/windowUtils';

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
  // Initialize position and size from props
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragMouseStartRef = useRef({ x: 0, y: 0 });
  const resizeStartSizeRef = useRef({ width: 0, height: 0 });
  const resizeStartPosRef = useRef({ x: 0, y: 0 });
  const resizeMouseStartRef = useRef({ x: 0, y: 0 });
  const currentSizeRef = useRef({ width: 0, height: 0 });
  const currentPositionRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Update position when initialPosition changes from store (only when not maximized and not dragging)
  useEffect(() => {
    if (!isMaximized && !isDragging) {
      setPosition(initialPosition);
    }
  }, [initialPosition.x, initialPosition.y, isMaximized, isDragging]);

  // Update size when initialSize changes from store (only when not maximized and not resizing)
  useEffect(() => {
    if (!isMaximized && !isResizing) {
      setSize(initialSize);
    }
  }, [initialSize.width, initialSize.height, isMaximized, isResizing]);

  // Update z-index directly in DOM when it changes
  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.style.zIndex = String(zIndex);
    }
  }, [zIndex]);

  // Handle maximized state - move below menu bar
  useEffect(() => {
    if (isMaximized) {
      setPosition({ x: 0, y: MENU_BAR_HEIGHT });
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

  // Handle drag start - only on title bar, not on buttons
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't drag if clicking on buttons or if maximized
      const target = e.target as HTMLElement;
      if (
        isMaximized ||
        target.closest('button') ||
        target.closest('.retro-titlebar-controls')
      ) {
        return;
      }

      // Prevent default to avoid text selection
      e.preventDefault();
      e.stopPropagation();

      // Focus the window when starting to drag
      if (onFocus) {
        onFocus();
      }

      // Store the current position and mouse position when drag starts
      dragStartPosRef.current = { ...position };
      dragMouseStartRef.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
    },
    [isMaximized, onFocus, position]
  );

  // Handle drag movement and end
  useEffect(() => {
    if (!isDragging || isMaximized) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate how far the mouse has moved from where we started dragging
      const deltaX = e.clientX - dragMouseStartRef.current.x;
      const deltaY = e.clientY - dragMouseStartRef.current.y;

      // Calculate new position based on where the window was when we started dragging
      const newPosition = {
        x: dragStartPosRef.current.x + deltaX,
        y: dragStartPosRef.current.y + deltaY,
      };

      // Get current window dimensions
      const currentWidth = initialSize.width;
      const currentHeight = initialSize.height;

      // Constrain to viewport (keep at least part of window visible)
      const minX = -(currentWidth - 100); // Allow dragging off-screen but keep some visible
      const minY = 0; // Don't allow dragging above the top
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;

      const constrainedPosition = {
        x: Math.max(minX, Math.min(newPosition.x, maxX)),
        y: Math.max(minY, Math.min(newPosition.y, maxY)),
      };

      setPosition(constrainedPosition);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);

      // Calculate final position
      const deltaX = e.clientX - dragMouseStartRef.current.x;
      const deltaY = e.clientY - dragMouseStartRef.current.y;

      const finalPosition = {
        x: dragStartPosRef.current.x + deltaX,
        y: dragStartPosRef.current.y + deltaY,
      };

      // Get current window dimensions
      const currentWidth = initialSize.width;
      const currentHeight = initialSize.height;

      // Constrain to viewport
      const minX = -(currentWidth - 100);
      const minY = 0;
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;

      const constrainedFinalPosition = {
        x: Math.max(minX, Math.min(finalPosition.x, maxX)),
        y: Math.max(minY, Math.min(finalPosition.y, maxY)),
      };

      setPosition(constrainedFinalPosition);

      // Save position when dragging ends
      if (onPositionChange) {
        onPositionChange(constrainedFinalPosition);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMaximized, onPositionChange, initialSize.width, initialSize.height]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: string) => {
      if (isMaximized) return;

      e.preventDefault();
      e.stopPropagation();

      // Focus the window when starting to resize
      if (onFocus) {
        onFocus();
      }

      // Store the current size, position, and mouse position when resize starts
      resizeStartSizeRef.current = { ...size };
      resizeStartPosRef.current = { ...position };
      resizeMouseStartRef.current = { x: e.clientX, y: e.clientY };
      currentSizeRef.current = { ...size };
      currentPositionRef.current = { ...position };
      setResizeHandle(handle);
      setIsResizing(true);
    },
    [isMaximized, onFocus, size, position]
  );

  // Handle resize movement and end
  useEffect(() => {
    if (!isResizing || isMaximized || !resizeHandle) return;

    const minSize = getMinWindowSize();

    // Set cursor on document body based on resize handle
    const getCursor = (handle: string) => {
      if (handle === 'nw' || handle === 'se') return 'nwse-resize';
      if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
      if (handle === 'n' || handle === 's') return 'ns-resize';
      if (handle === 'e' || handle === 'w') return 'ew-resize';
      return 'default';
    };

    document.body.style.cursor = getCursor(resizeHandle);
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate how far the mouse has moved from where we started resizing
      let deltaX = e.clientX - resizeMouseStartRef.current.x;
      let deltaY = e.clientY - resizeMouseStartRef.current.y;

      let newWidth = resizeStartSizeRef.current.width;
      let newHeight = resizeStartSizeRef.current.height;
      let newX = resizeStartPosRef.current.x;
      let newY = resizeStartPosRef.current.y;

      // Calculate new size based on mouse movement
      if (resizeHandle.includes('e')) {
        // Right edge - resize to the right
        newWidth = resizeStartSizeRef.current.width + deltaX;
      }
      if (resizeHandle.includes('w')) {
        // Left edge - resize to the left
        newWidth = resizeStartSizeRef.current.width - deltaX;
        newX = resizeStartPosRef.current.x + deltaX;
      }
      if (resizeHandle.includes('s')) {
        // Bottom edge - resize downward
        newHeight = resizeStartSizeRef.current.height + deltaY;
      }
      if (resizeHandle.includes('n')) {
        // Top edge - resize upward
        newHeight = resizeStartSizeRef.current.height - deltaY;
        newY = resizeStartPosRef.current.y + deltaY;
      }

      // Enforce minimum size (no position locking, just enforce minimum)
      newWidth = Math.max(minSize.width, newWidth);
      newHeight = Math.max(minSize.height, newHeight);

      // Constrain position to viewport
      const minX = -(newWidth - 100);
      const minY = 0;
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;

      const constrainedPosition = {
        x: Math.max(minX, Math.min(newX, maxX)),
        y: Math.max(minY, Math.min(newY, maxY)),
      };

      // Ensure width/height don't exceed viewport
      const maxWidth = window.innerWidth - constrainedPosition.x + 100;
      const maxHeight = window.innerHeight - constrainedPosition.y + 100;

      const constrainedSize = {
        width: Math.max(minSize.width, Math.min(newWidth, maxWidth)),
        height: Math.max(minSize.height, Math.min(newHeight, maxHeight)),
      };

      // Store current values in refs for use in mouseup handler
      currentSizeRef.current = constrainedSize;
      currentPositionRef.current = constrainedPosition;

      setSize(constrainedSize);
      setPosition(constrainedPosition);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);

      // Restore cursor and user select
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Save size and position when resizing ends using refs to get current values
      if (onSizeChange) {
        onSizeChange(currentSizeRef.current);
      }
      if (onPositionChange) {
        onPositionChange(currentPositionRef.current);
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Cleanup cursor in case component unmounts during resize
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, isMaximized, resizeHandle, onSizeChange, onPositionChange]);

  // Hide window if minimized (no animation)
  if (isMinimized) {
    return null;
  }

  const windowWidth = isMaximized ? window.innerWidth : size.width;
  const windowHeight = isMaximized ? window.innerHeight - MENU_BAR_HEIGHT : size.height;

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
        userSelect: isDragging ? 'none' : 'auto',
      }}
      onClick={handleWindowClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`window-title-${id}`}
      tabIndex={-1}
    >
      {/* Title Bar */}
      <div
        className="retro-titlebar cursor-move"
        onMouseDown={handleMouseDown}
        onKeyDown={handleTitleBarKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${title} window title bar`}
      >
        <span id={`window-title-${id}`} className="retro-titlebar-text">
          {title}
        </span>
        <div
          className="retro-titlebar-controls"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Minimize Button */}
          {onMinimize && (
            <button
              type="button"
              className="retro-window-control retro-focus-ring"
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              aria-label={`Minimize ${title} window`}
            >
              _
            </button>
          )}
          {/* Maximize/Restore Button */}
          {onMaximize && (
            <button
              type="button"
              className="retro-window-control retro-focus-ring"
              onClick={(e) => {
                e.stopPropagation();
                // Save current position before maximizing
                if (!isMaximized && onPositionChange) {
                  onPositionChange(position);
                }
                onMaximize();
              }}
              aria-label={`${isMaximized ? 'Restore' : 'Maximize'} ${title} window`}
            >
              {isMaximized ? '❐' : '□'}
            </button>
          )}
          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              className="retro-window-control retro-focus-ring"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label={`Close ${title} window`}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="retro-window-content h-[calc(100%-32px)] overflow-auto p-6">
        {children}
      </div>

      {/* Resize Handles - only show when not maximized */}
      {!isMaximized && (
        <>
          {/* Corner handles */}
          <div
            className="retro-resize-handle retro-resize-handle-nw"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            style={{ cursor: 'nwse-resize' }}
          />
          <div
            className="retro-resize-handle retro-resize-handle-ne"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            style={{ cursor: 'nesw-resize' }}
          />
          <div
            className="retro-resize-handle retro-resize-handle-sw"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            style={{ cursor: 'nesw-resize' }}
          />
          <div
            className="retro-resize-handle retro-resize-handle-se"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            style={{ cursor: 'nwse-resize' }}
          />
          {/* Edge handles */}
          <div
            className="retro-resize-handle retro-resize-handle-n"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            style={{ cursor: 'ns-resize' }}
          />
          <div
            className="retro-resize-handle retro-resize-handle-s"
            onMouseDown={(e) => handleResizeStart(e, 's')}
            style={{ cursor: 'ns-resize' }}
          />
          <div
            className="retro-resize-handle retro-resize-handle-w"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            style={{ cursor: 'ew-resize' }}
          />
          <div
            className="retro-resize-handle retro-resize-handle-e"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            style={{ cursor: 'ew-resize' }}
          />
        </>
      )}
    </div>
  );
}
