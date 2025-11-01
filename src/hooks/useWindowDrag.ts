/**
 * Hook for window dragging functionality
 * Handles mouse drag events and position updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { constrainPositionToViewport } from '../utils/viewportConstraints';
import type { Position, Size } from '../utils/viewportConstraints';

export interface UseWindowDragOptions {
  initialPosition: Position;
  initialSize: Size;
  isMaximized: boolean;
  onFocus?: () => void;
  onPositionChange?: (position: Position) => void;
}

export function useWindowDrag({
  initialPosition,
  initialSize,
  isMaximized,
  onFocus,
  onPositionChange,
}: UseWindowDragOptions) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragMouseStartRef = useRef({ x: 0, y: 0 });
  const lastSyncedPositionRef = useRef(initialPosition);

  // Update position when initialPosition changes from store (only when not maximized and not dragging)
  useEffect(() => {
    if (!isMaximized && !isDragging) {
      // Only sync if initialPosition actually changed from what we last synced
      if (
        lastSyncedPositionRef.current.x !== initialPosition.x ||
        lastSyncedPositionRef.current.y !== initialPosition.y
      ) {
        setPosition(initialPosition);
        lastSyncedPositionRef.current = initialPosition;
      }
    }
  }, [initialPosition.x, initialPosition.y, isMaximized, isDragging]);

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

      // Constrain to viewport
      const constrainedPosition = constrainPositionToViewport(
        newPosition,
        initialSize
      );

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

      // Constrain to viewport
      const constrainedFinalPosition = constrainPositionToViewport(
        finalPosition,
        initialSize
      );

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
  }, [isDragging, isMaximized, onPositionChange, initialSize]);

  return {
    position,
    isDragging,
    handleMouseDown,
  };
}

