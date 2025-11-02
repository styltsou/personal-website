/**
 * Hook for window dragging functionality
 * Handles mouse drag events and position updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { constrainPositionToViewport } from '../utils/viewportConstraints';
import { detectSnapSideFromMouse, MENU_BAR_HEIGHT } from '../utils/windowUtils';
import type { Position, Size } from '../utils/viewportConstraints';
import type { SnapSide } from '../stores/windowStore';

export interface UseWindowDragOptions {
  initialPosition: Position;
  initialSize: Size;
  isMaximized: boolean;
  snapSide: SnapSide;
  onFocus?: () => void;
  onPositionChange?: (position: Position) => void;
  onSizeChange?: (size: Size) => void;
  onSnap?: (snapSide: SnapSide) => void;
  onUnsnap?: () => void;
}

export function useWindowDrag({
  initialPosition,
  initialSize,
  isMaximized,
  snapSide,
  onFocus,
  onPositionChange,
  onSizeChange,
  onSnap,
  onUnsnap,
}: UseWindowDragOptions) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [previewSnapSide, setPreviewSnapSide] = useState<SnapSide>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragMouseStartRef = useRef({ x: 0, y: 0 });
  const lastSyncedPositionRef = useRef(initialPosition);
  const currentSizeRef = useRef(initialSize);
  const hasUnsnappedDuringDragRef = useRef(false);
  const snapStartMouseEdgeRef = useRef<'left' | 'right' | null>(null); // Which edge mouse was on when dragging started from snapped window
  const lastClickTimeRef = useRef(0);
  const lastClickPositionRef = useRef({ x: 0, y: 0 });

  // Sync position from store when initialPosition changes (e.g., after snapping)
  // Only sync when not maximized and not dragging
  useEffect(() => {
    if (!isMaximized && !isDragging) {
      // Sync if position actually changed from what we last synced
      if (
        lastSyncedPositionRef.current.x !== initialPosition.x ||
        lastSyncedPositionRef.current.y !== initialPosition.y
      ) {
        setPosition(initialPosition);
        lastSyncedPositionRef.current = initialPosition;
      }
    }
  }, [initialPosition.x, initialPosition.y, isMaximized, isDragging, snapSide]);

  // Sync size from store when initialSize changes (e.g., after unsnapping)
  // Only sync when not maximized and not dragging
  useEffect(() => {
    if (!isMaximized && !isDragging) {
      if (
        currentSizeRef.current.width !== initialSize.width ||
        currentSizeRef.current.height !== initialSize.height
      ) {
        currentSizeRef.current = initialSize;
      }
    }
  }, [initialSize.width, initialSize.height, isMaximized, isDragging]);

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

      // Check if this is a potential double-click scenario
      // If clicks are very close in time and position, prevent drag start
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;
      const clickPosition = { x: e.clientX, y: e.clientY };
      const distanceFromLastClick = Math.sqrt(
        Math.pow(clickPosition.x - lastClickPositionRef.current.x, 2) +
          Math.pow(clickPosition.y - lastClickPositionRef.current.y, 2)
      );

      // If clicks are within 400ms and 10px of each other, it might be a double-click
      // Prevent drag start to let double-click handler take over
      const isPotentialDoubleClick =
        timeSinceLastClick < 400 && distanceFromLastClick < 10;

      // If this might be a double-click, prevent drag start and cancel any ongoing drag
      if (isPotentialDoubleClick) {
        // Cancel any ongoing drag if we're in a double-click scenario
        if (isDragging) {
          setIsDragging(false);
          setPreviewSnapSide(null);
        }
        // Update tracking for the next potential click
        lastClickTimeRef.current = now;
        lastClickPositionRef.current = clickPosition;
        // Don't start drag - let double-click handler take over if it's a double-click
        return;
      }

      // Update click tracking
      lastClickTimeRef.current = now;
      lastClickPositionRef.current = clickPosition;

      // Prevent default to avoid text selection
      e.preventDefault();
      e.stopPropagation();

      // Focus the window when starting to drag
      if (onFocus) {
        onFocus();
      }

      // If window is snapped, start dragging from the snapped visual position
      // We'll unsnap only when the mouse moves away from the snap side
      // Position is always correct in store (not overridden when maximized)
      let startPosition = position;
      hasUnsnappedDuringDragRef.current = false;
      snapStartMouseEdgeRef.current = null;

      if (snapSide) {
        // Calculate the snapped visual position to start drag from
        // This prevents the window from jumping when dragging starts
        const viewportWidth = window.innerWidth;
        const halfWidth = viewportWidth / 2;
        const snappedWidth = halfWidth;

        if (snapSide === 'left') {
          startPosition = { x: 0, y: MENU_BAR_HEIGHT };
        } else if (snapSide === 'right') {
          startPosition = { x: halfWidth, y: MENU_BAR_HEIGHT };
        }

        // Determine which edge of the title bar the mouse is on
        // This will be used to determine resize direction when unsnapping
        const mouseOffsetX = e.clientX - startPosition.x;
        const titleBarMidpoint = snappedWidth / 2;
        snapStartMouseEdgeRef.current =
          mouseOffsetX < titleBarMidpoint ? 'left' : 'right';

        // Set the current position to the snapped position so drag starts smoothly
        setPosition(startPosition);

        // Use actual size for constraints (size never changes during snapping)
        currentSizeRef.current = initialSize;
      } else {
        // Not snapped - use current size for constraints
        currentSizeRef.current = initialSize;
      }

      // Store the start position and mouse position when drag starts
      dragStartPosRef.current = { ...startPosition };
      dragMouseStartRef.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
    },
    [
      isMaximized,
      onFocus,
      position,
      initialPosition,
      snapSide,
      onUnsnap,
      onPositionChange,
    ]
  );

  // Handle drag movement and end
  useEffect(() => {
    if (!isDragging || isMaximized) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Detect snap preview during dragging based on mouse cursor position
      const detectedSnapSide = detectSnapSideFromMouse(e.clientX);
      setPreviewSnapSide(detectedSnapSide);

      // If window was snapped and we're moving away from the snap side, unsnap it
      // This restores the original size by resizing from the opposite edge
      if (
        snapSide &&
        !hasUnsnappedDuringDragRef.current &&
        onUnsnap &&
        onSizeChange
      ) {
        // Check if we're moving away from the snap side
        // This happens if detectedSnapSide is different OR null (not detecting a snap)
        const isMovingAway = detectedSnapSide !== snapSide;

        if (isMovingAway) {
          // Size never changes during snapping, so use initialSize
          const newSize = initialSize;

          // Validate size is reasonable
          if (!newSize || newSize.width <= 0 || newSize.height <= 0) {
            console.error('Invalid size during unsnap:', newSize);
            // Fall back to a default size
            newSize.width = initialSize.width || 900;
            newSize.height = initialSize.height || 700;
          }

          currentSizeRef.current = newSize;

          // Calculate new position based on which edge to resize from
          // Use the cursor's CURRENT position relative to the window's CURRENT position during drag
          let newPosition: Position;

          // Calculate the window's current position during dragging
          const deltaX = e.clientX - dragMouseStartRef.current.x;
          const currentWindowX = dragStartPosRef.current.x + deltaX;

          // Get the snapped window's visual size (width is half viewport)
          const viewportWidth = window.innerWidth;
          const snappedWidth = viewportWidth / 2;

          // Calculate where the cursor is relative to the window's CURRENT title bar position
          const mouseOffsetX = e.clientX - currentWindowX;
          const titleBarMidpoint = snappedWidth / 2;
          const currentMouseEdge =
            mouseOffsetX < titleBarMidpoint ? 'left' : 'right';

          // The goal is to keep the cursor at the same relative position in the title bar
          // Calculate the cursor's offset from the window's left edge as a ratio
          const cursorRatioInTitleBar = mouseOffsetX / snappedWidth;

          if (snapSide === 'left') {
            if (currentMouseEdge === 'right') {
              // Mouse is currently on right side of left-snapped window
              // Resize from left: keep the cursor at the same relative position
              // Cursor should be at: cursorRatio * newSize.width from the left edge
              newPosition = {
                x: e.clientX - cursorRatioInTitleBar * newSize.width,
                y:
                  dragStartPosRef.current.y +
                  (e.clientY - dragMouseStartRef.current.y),
              };
            } else {
              // Mouse is currently on left side of left-snapped window
              // Resize from right: keep the cursor at the same relative position
              newPosition = {
                x: e.clientX - cursorRatioInTitleBar * newSize.width,
                y:
                  dragStartPosRef.current.y +
                  (e.clientY - dragMouseStartRef.current.y),
              };
            }
          } else {
            // snapSide === 'right'
            if (currentMouseEdge === 'left') {
              // Mouse is currently on left side of right-snapped window
              // Resize from right: keep the cursor at the same relative position
              newPosition = {
                x: e.clientX - cursorRatioInTitleBar * newSize.width,
                y:
                  dragStartPosRef.current.y +
                  (e.clientY - dragMouseStartRef.current.y),
              };
            } else {
              // Mouse is currently on right side of right-snapped window
              // Resize from left: keep the cursor at the same relative position
              newPosition = {
                x: e.clientX - cursorRatioInTitleBar * newSize.width,
                y:
                  dragStartPosRef.current.y +
                  (e.clientY - dragMouseStartRef.current.y),
              };
            }
          }

          // Constrain position to viewport
          const constrainedPosition = constrainPositionToViewport(
            newPosition,
            newSize
          );

          // Update size and position in store BEFORE unsnapping
          onSizeChange(newSize);
          if (onPositionChange) {
            onPositionChange(constrainedPosition);
          }

          // Unsnap - this updates the store (snapSide becomes null)
          onUnsnap();
          hasUnsnappedDuringDragRef.current = true;

          // Update local state with new position
          setPosition(constrainedPosition);

          // Update drag start references for smooth continuation
          dragStartPosRef.current = { ...constrainedPosition };
          dragMouseStartRef.current = { x: e.clientX, y: e.clientY };

          // Return early - position and size are already set
          return;
        }
      }

      // Normal drag calculation (not unsnapping)
      const deltaX = e.clientX - dragMouseStartRef.current.x;
      const deltaY = e.clientY - dragMouseStartRef.current.y;

      // Calculate new position based on where the window was when we started dragging
      const newPosition = {
        x: dragStartPosRef.current.x + deltaX,
        y: dragStartPosRef.current.y + deltaY,
      };

      // Use current size (which may have been restored from snap)
      const sizeToUse = currentSizeRef.current;

      // Constrain to viewport
      const constrainedPosition = constrainPositionToViewport(
        newPosition,
        sizeToUse
      );

      setPosition(constrainedPosition);
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Detect snap condition BEFORE setting isDragging to false
      // This ensures we can check state before React batches updates
      const detectedSnapSide = detectSnapSideFromMouse(e.clientX);

      // Calculate final position
      const deltaX = e.clientX - dragMouseStartRef.current.x;
      const deltaY = e.clientY - dragMouseStartRef.current.y;

      const finalPosition = {
        x: dragStartPosRef.current.x + deltaX,
        y: dragStartPosRef.current.y + deltaY,
      };

      // Use current size (which may have been restored from snap)
      const sizeToUse = currentSizeRef.current;

      // Constrain to viewport
      const constrainedFinalPosition = constrainPositionToViewport(
        finalPosition,
        sizeToUse
      );

      // Now set dragging to false - this will trigger useEffect sync
      setIsDragging(false);
      setPreviewSnapSide(null);

      if (detectedSnapSide) {
        // Snap detected - snap if different from current snap side
        if (detectedSnapSide !== snapSide && onSnap) {
          // Store update happens synchronously, then React re-renders with new initialPosition
          // The useEffect above will sync position when isDragging becomes false
          onSnap(detectedSnapSide);
        }
        // If already snapped to same side, do nothing (already snapped correctly)
      } else if (
        snapSide &&
        !hasUnsnappedDuringDragRef.current &&
        onUnsnap &&
        onSizeChange
      ) {
        // No snap detected but window was previously snapped - unsnap it
        // This handles the case where we didn't unsnap during mouse move
        // Size never changes during snapping, so use initialSize
        const newSize = initialSize;

        // Validate size is reasonable
        if (!newSize || newSize.width <= 0 || newSize.height <= 0) {
          console.error('Invalid size during unsnap on mouse up:', newSize);
          newSize.width = initialSize.width || 900;
          newSize.height = initialSize.height || 700;
        }

        currentSizeRef.current = newSize;

        // Calculate new position based on which edge to resize from
        // Use the cursor's CURRENT position relative to the window's CURRENT position during drag
        const viewportWidth = window.innerWidth;
        const snappedWidth = viewportWidth / 2;

        // Calculate the window's current position during dragging (from the final position)
        const currentWindowX = constrainedFinalPosition.x;

        // Calculate where the cursor is relative to the window's CURRENT title bar position
        const mouseOffsetX = e.clientX - currentWindowX;

        // The goal is to keep the cursor at the same relative position in the title bar
        // Calculate the cursor's offset from the window's left edge as a ratio
        const cursorRatioInTitleBar = mouseOffsetX / snappedWidth;

        // Position the window so the cursor is at the same relative position in the new window
        // Formula: windowX = mouseX - (cursorRatio * newWindowWidth)
        const newPosition: Position = {
          x: e.clientX - cursorRatioInTitleBar * newSize.width,
          y: constrainedFinalPosition.y,
        };

        // Constrain position to viewport
        const adjustedPosition = constrainPositionToViewport(
          newPosition,
          newSize
        );

        // Update size and position in store BEFORE unsnapping
        onSizeChange(newSize);
        if (onPositionChange) {
          onPositionChange(adjustedPosition);
        }

        // Unsnap - this updates the store (snapSide becomes null)
        onUnsnap();

        // Update position with adjusted position
        setPosition(adjustedPosition);
      } else {
        // No snap detected and not previously snapped - just update position normally
        setPosition(constrainedFinalPosition);
        if (onPositionChange) {
          onPositionChange(constrainedFinalPosition);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isMaximized,
    onPositionChange,
    onSnap,
    onUnsnap,
    initialSize,
    snapSide,
  ]);

  return {
    position,
    isDragging,
    previewSnapSide,
    handleMouseDown,
  };
}
