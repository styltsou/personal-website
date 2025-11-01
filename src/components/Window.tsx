/**
 * Window Component
 * Draggable, resizable window with 90s OS aesthetic
 * Uses native drag handling for better z-index control
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { MENU_BAR_HEIGHT } from '../utils/windowUtils';

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
  zIndex,
  isMinimized = false,
  isMaximized = false,
  isActive = false,
}: WindowProps) {
  // Initialize position from initialPosition prop
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragMouseStartRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Update position when initialPosition changes from store (only when not maximized and not dragging)
  useEffect(() => {
    if (!isMaximized && !isDragging) {
      setPosition(initialPosition);
    }
  }, [initialPosition.x, initialPosition.y, isMaximized, isDragging]);

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

  // Hide window if minimized (no animation)
  if (isMinimized) {
    return null;
  }

  const windowWidth = isMaximized ? window.innerWidth : initialSize.width;
  const windowHeight = isMaximized ? window.innerHeight - MENU_BAR_HEIGHT : initialSize.height;

  return (
    <div
      ref={windowRef}
      className={`retro-window ${isActive ? 'active' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
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
    </div>
  );
}
