/**
 * Hook for window resizing functionality
 * Handles mouse resize events and size/position updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getMinWindowSize } from '../utils/windowUtils';
import {
  constrainPositionToViewport,
  constrainSizeToViewport,
  type Position,
  type Size,
} from '../utils/viewportConstraints';

export interface UseWindowResizeOptions {
  initialSize: Size;
  initialPosition: Position;
  isMaximized: boolean;
  onFocus?: () => void;
  onSizeChange?: (size: Size) => void;
  onPositionChange?: (position: Position) => void;
  getCurrentPosition?: () => Position;
}

export function useWindowResize({
  initialSize,
  initialPosition,
  isMaximized,
  onFocus,
  onSizeChange,
  onPositionChange,
  getCurrentPosition,
}: UseWindowResizeOptions) {
  const [size, setSize] = useState(initialSize);
  const [position, setPosition] = useState(initialPosition);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const resizeStartSizeRef = useRef({ width: 0, height: 0 });
  const resizeStartPosRef = useRef({ x: 0, y: 0 });
  const resizeMouseStartRef = useRef({ x: 0, y: 0 });
  const currentSizeRef = useRef({ width: 0, height: 0 });
  const currentPositionRef = useRef({ x: 0, y: 0 });
  const lastSyncedSizeRef = useRef(initialSize);

  // Update size when initialSize changes from store (only when not maximized and not resizing)
  useEffect(() => {
    if (!isMaximized && !isResizing) {
      // Only sync if initialSize actually changed from what we last synced
      if (
        lastSyncedSizeRef.current.width !== initialSize.width ||
        lastSyncedSizeRef.current.height !== initialSize.height
      ) {
        setSize(initialSize);
        lastSyncedSizeRef.current = initialSize;
      }
    }
  }, [initialSize.width, initialSize.height, isMaximized, isResizing]);

  // Get cursor style based on resize handle
  const getCursor = useCallback((handle: string): string => {
    if (handle === 'nw' || handle === 'se') return 'nwse-resize';
    if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
    if (handle === 'n' || handle === 's') return 'ns-resize';
    if (handle === 'e' || handle === 'w') return 'ew-resize';
    return 'default';
  }, []);

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

      // Get the current actual window position (from drag hook) if available
      const currentPos = getCurrentPosition ? getCurrentPosition() : position;
      
      // Sync the position state with the actual current position to prevent abrupt jumps
      setPosition(currentPos);

      // Store the current size, position, and mouse position when resize starts
      resizeStartSizeRef.current = { ...size };
      resizeStartPosRef.current = { ...currentPos };
      resizeMouseStartRef.current = { x: e.clientX, y: e.clientY };
      currentSizeRef.current = { ...size };
      currentPositionRef.current = { ...currentPos };
      setResizeHandle(handle);
      setIsResizing(true);
    },
    [isMaximized, onFocus, size, position, getCurrentPosition]
  );

  // Handle resize movement and end
  useEffect(() => {
    if (!isResizing || isMaximized || !resizeHandle) return;

    const minSize = getMinWindowSize();

    // Set cursor on document body based on resize handle
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
      const constrainedPosition = constrainPositionToViewport(
        { x: newX, y: newY },
        { width: newWidth, height: newHeight }
      );

      // Constrain size to viewport with minimum size
      const constrainedSize = constrainSizeToViewport(
        { width: newWidth, height: newHeight },
        constrainedPosition,
        minSize
      );

      // Store current values in refs for use in mouseup handler
      currentSizeRef.current = constrainedSize;
      currentPositionRef.current = constrainedPosition;

      setSize(constrainedSize);
      setPosition(constrainedPosition);
    };

    const handleMouseUp = () => {
      // For left/top edge resizes, position changes must be persisted to drag hook
      // Check if resize handle involves left or top edges (which change position)
      const positionChanged = 
        resizeHandle?.includes('w') || resizeHandle?.includes('n');
      
      // Save position change BEFORE ending resize state to ensure drag hook updates first
      // This prevents the window from jumping back when resize ends
      if (positionChanged && onPositionChange) {
        onPositionChange(currentPositionRef.current);
      }

      // Save size when resizing ends using refs to get current values
      if (onSizeChange) {
        onSizeChange(currentSizeRef.current);
      }

      // End resize state after position/size updates have been queued
      setIsResizing(false);
      setResizeHandle(null);

      // Restore cursor and user select
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
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
  }, [
    isResizing,
    isMaximized,
    resizeHandle,
    onSizeChange,
    onPositionChange,
    getCursor,
  ]);

  return {
    size,
    position,
    isResizing,
    handleResizeStart,
  };
}

