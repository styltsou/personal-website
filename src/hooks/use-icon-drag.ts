/**
 * Hook for icon dragging functionality
 * Handles mouse drag events, snap-to-grid positioning, and collision detection
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  snapToGrid,
  gridToPixel,
  constrainToViewport,
  findNearestFreeCell,
  getOccupiedCells,
  constrainGridPosition,
  ICON_WIDTH,
  ICON_HEIGHT,
  type PixelPosition,
  type GridPosition,
} from '../utils/icon-grid';
import { useIconStore, type IconState } from '../stores/icon-store';
import { useWindowStore } from '../stores/window-store';
import { getSnappedPreview, getMaximizedWindowSize, getMaximizedWindowPosition, MENU_BAR_HEIGHT } from '../utils/window-utils';

export interface UseIconDragOptions {
  iconId: string;
  initialGridPosition: GridPosition;
  onPositionChange: (gridPosition: GridPosition) => void;
}

export function useIconDrag({
  iconId,
  initialGridPosition,
  onPositionChange,
}: UseIconDragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<PixelPosition | null>(null);
  const [previewGridPosition, setPreviewGridPosition] = useState<GridPosition | null>(null);
  const dragStartPosRef = useRef<PixelPosition | null>(null);
  const dragMouseStartRef = useRef<PixelPosition | null>(null);
  const lastClickTimeRef = useRef(0);
  const lastClickPositionRef = useRef({ x: 0, y: 0 });

  // Get all icon states from store for collision detection
  const iconStates = useIconStore((state) => state.iconStates);
  const setDraggingIcon = useIconStore((state) => state.setDraggingIcon);
  
  // Get window states to check for window overlap
  const windowStates = useWindowStore((state) => state.windowStates);

  // Helper function to check if icon position overlaps with another icon
  const isPositionOverIcon = useCallback((iconPos: PixelPosition): boolean => {
    // Snap to grid to check if position would overlap with another icon
    const snappedGrid = snapToGrid(iconPos.x, iconPos.y);
    const constrainedGrid = constrainGridPosition(snappedGrid.gridX, snappedGrid.gridY);
    
    // Get occupied cells (excluding current icon's position)
    const occupiedCells = getOccupiedCells(
      iconStates
        .filter((state) => state.id !== iconId)
        .map((state) => state.position)
    );
    
    // Check if the target grid cell is occupied
    const targetCellKey = `${constrainedGrid.gridX},${constrainedGrid.gridY}`;
    return occupiedCells.has(targetCellKey);
  }, [iconId, iconStates]);

  // Helper function to check if icon position overlaps with any window
  const isPositionOverWindow = useCallback((iconPos: PixelPosition): boolean => {
    // Check if icon center or any part of icon overlaps with any window
    const iconCenterX = iconPos.x + ICON_WIDTH / 2;
    const iconCenterY = iconPos.y + ICON_HEIGHT / 2;
    const iconLeft = iconPos.x;
    const iconRight = iconPos.x + ICON_WIDTH;
    const iconTop = iconPos.y;
    const iconBottom = iconPos.y + ICON_HEIGHT;

    // Check against all visible (non-minimized) windows
    return windowStates.some((ws) => {
      if (ws.isMinimized) return false;

      let windowX: number;
      let windowY: number;
      let windowWidth: number;
      let windowHeight: number;

      if (ws.isMaximized) {
        // Maximized window
        windowX = 0;
        windowY = MENU_BAR_HEIGHT;
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight - MENU_BAR_HEIGHT;
      } else if (ws.snapSide) {
        // Snapped window
        const snapped = getSnappedPreview(ws.snapSide);
        windowX = snapped.position.x;
        windowY = snapped.position.y;
        windowWidth = snapped.size.width;
        windowHeight = snapped.size.height;
      } else {
        // Normal window
        windowX = ws.position.x;
        windowY = ws.position.y;
        windowWidth = ws.size.width;
        windowHeight = ws.size.height;
      }

      const windowLeft = windowX;
      const windowRight = windowX + windowWidth;
      const windowTop = windowY;
      const windowBottom = windowY + windowHeight;

      // Check if icon overlaps with window (check if icon center is inside window OR any corner is inside)
      const centerInside =
        iconCenterX >= windowLeft &&
        iconCenterX <= windowRight &&
        iconCenterY >= windowTop &&
        iconCenterY <= windowBottom;

      // Check if any icon corner is inside window
      const topLeftInside =
        iconLeft >= windowLeft &&
        iconLeft <= windowRight &&
        iconTop >= windowTop &&
        iconTop <= windowBottom;
      const topRightInside =
        iconRight >= windowLeft &&
        iconRight <= windowRight &&
        iconTop >= windowTop &&
        iconTop <= windowBottom;
      const bottomLeftInside =
        iconLeft >= windowLeft &&
        iconLeft <= windowRight &&
        iconBottom >= windowTop &&
        iconBottom <= windowBottom;
      const bottomRightInside =
        iconRight >= windowLeft &&
        iconRight <= windowRight &&
        iconBottom >= windowTop &&
        iconBottom <= windowBottom;

      // Check if icon fully contains window (edge case)
      const iconContainsWindow =
        iconLeft <= windowLeft &&
        iconRight >= windowRight &&
        iconTop <= windowTop &&
        iconBottom >= windowBottom;

      // Check if window fully contains icon (most common case)
      const windowContainsIcon =
        windowLeft <= iconLeft &&
        windowRight >= iconRight &&
        windowTop <= iconTop &&
        windowBottom >= iconBottom;

      return (
        centerInside ||
        topLeftInside ||
        topRightInside ||
        bottomLeftInside ||
        bottomRightInside ||
        iconContainsWindow ||
        windowContainsIcon
      );
    });
  }, [windowStates]);

  // Convert initial grid position to pixel position
  const initialPixelPosition = gridToPixel(
    initialGridPosition.gridX,
    initialGridPosition.gridY
  );

  // Sync position when initialGridPosition changes (when not dragging)
  useEffect(() => {
    if (!isDragging) {
      const pixelPos = gridToPixel(
        initialGridPosition.gridX,
        initialGridPosition.gridY
      );
      setDragPosition(null);
      setPreviewGridPosition(null);
      dragStartPosRef.current = null;
    }
  }, [initialGridPosition.gridX, initialGridPosition.gridY, isDragging]);

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Prevent default to avoid text selection
      e.preventDefault();
      e.stopPropagation();

      // Check if this is a potential double-click scenario
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;
      const clickPosition = { x: e.clientX, y: e.clientY };
      const distanceFromLastClick = Math.sqrt(
        Math.pow(clickPosition.x - lastClickPositionRef.current.x, 2) +
          Math.pow(clickPosition.y - lastClickPositionRef.current.y, 2)
      );

      // If clicks are within 400ms and 10px of each other, it might be a double-click
      const isPotentialDoubleClick =
        timeSinceLastClick < 400 && distanceFromLastClick < 10;

      // If this might be a double-click, prevent drag start
      if (isPotentialDoubleClick) {
        if (isDragging) {
          setIsDragging(false);
          setDragPosition(null);
        }
        lastClickTimeRef.current = now;
        lastClickPositionRef.current = clickPosition;
        return;
      }

      // Update click tracking
      lastClickTimeRef.current = now;
      lastClickPositionRef.current = clickPosition;

      // Get current pixel position
      const currentPixelPos = gridToPixel(
        initialGridPosition.gridX,
        initialGridPosition.gridY
      );

      // Store drag start positions
      dragStartPosRef.current = { ...currentPixelPos };
      dragMouseStartRef.current = { x: e.clientX, y: e.clientY };
      setDragPosition(currentPixelPos);
      setIsDragging(true);
      setDraggingIcon(iconId, currentPixelPos); // Track dragging icon in store
      
      // Set cursor to grabbing when drag starts
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      // Add class to body for CSS-based cursor management
      document.body.classList.add('icon-dragging');
    },
    [initialGridPosition, isDragging, iconId, setDraggingIcon]
  );

  // Handle drag movement and end
  useEffect(() => {
    if (!isDragging || !dragStartPosRef.current || !dragMouseStartRef.current) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate delta from drag start
      const deltaX = e.clientX - dragMouseStartRef.current!.x;
      const deltaY = e.clientY - dragMouseStartRef.current!.y;

      // Calculate new position based on drag start position
      const newPosition: PixelPosition = {
        x: dragStartPosRef.current!.x + deltaX,
        y: dragStartPosRef.current!.y + deltaY,
      };

      // Constrain to viewport
      const constrainedPosition = constrainToViewport(newPosition);
      setDragPosition(constrainedPosition);
      setDraggingIcon(iconId, constrainedPosition); // Update position in store
      
      // Update cursor based on whether we're over a window or another icon
      // Check if the current position overlaps with any window or another icon
      const overWindow = isPositionOverWindow(constrainedPosition);
      const overIcon = isPositionOverIcon(constrainedPosition);
      
      if (overWindow) {
        document.body.style.cursor = 'not-allowed';
        document.body.classList.add('icon-dragging-over-window');
        document.body.classList.remove('icon-dragging-over-icon');
        // Hide preview when over a window
        setPreviewGridPosition(null);
      } else if (overIcon) {
        document.body.style.cursor = 'not-allowed';
        document.body.classList.add('icon-dragging-over-icon');
        document.body.classList.remove('icon-dragging-over-window');
        // Hide preview when over an icon
        setPreviewGridPosition(null);
      } else {
        document.body.style.cursor = 'grabbing';
        document.body.classList.remove('icon-dragging-over-window', 'icon-dragging-over-icon');
        
        // Show preview only when not over a window or icon
        // Calculate preview grid position (where it will snap to)
        const snappedGrid = snapToGrid(
          constrainedPosition.x,
          constrainedPosition.y
        );

        // Constrain to valid grid bounds
        const constrainedGrid = constrainGridPosition(
          snappedGrid.gridX,
          snappedGrid.gridY
        );

        // Get occupied cells (excluding current icon's position)
        const occupiedCells = getOccupiedCells(
          iconStates
            .filter((state) => state.id !== iconId)
            .map((state) => state.position)
        );

        // Find nearest free cell for preview
        const freeGrid = findNearestFreeCell(
          constrainedGrid.gridX,
          constrainedGrid.gridY,
          occupiedCells,
          initialGridPosition.gridX,
          initialGridPosition.gridY
        );

        setPreviewGridPosition(freeGrid);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Calculate final position
      const deltaX = e.clientX - dragMouseStartRef.current!.x;
      const deltaY = e.clientY - dragMouseStartRef.current!.y;

      const finalPosition: PixelPosition = {
        x: dragStartPosRef.current!.x + deltaX,
        y: dragStartPosRef.current!.y + deltaY,
      };

      // Constrain to viewport
      const constrainedFinalPosition = constrainToViewport(finalPosition);

      // Snap to grid
      const snappedGrid = snapToGrid(
        constrainedFinalPosition.x,
        constrainedFinalPosition.y
      );

      // Constrain to valid grid bounds
      const constrainedGrid = constrainGridPosition(
        snappedGrid.gridX,
        snappedGrid.gridY
      );

      // Get occupied cells (excluding current icon's position)
      const occupiedCells = getOccupiedCells(
        iconStates
          .filter((state) => state.id !== iconId)
          .map((state) => state.position)
      );

      // Find nearest free cell (excluding current icon's position)
      const freeGrid = findNearestFreeCell(
        constrainedGrid.gridX,
        constrainedGrid.gridY,
        occupiedCells,
        initialGridPosition.gridX,
        initialGridPosition.gridY
      );

      // Convert grid position to pixel position to check for window overlap
      const freeGridPixelPos = gridToPixel(freeGrid.gridX, freeGrid.gridY);

      // Check if the drop position overlaps with any window
      if (isPositionOverWindow(freeGridPixelPos)) {
        // If dropped over a window, keep original position (don't update)
        // Just reset drag state without calling onPositionChange
      } else {
        // Only update position if not over a window
        onPositionChange(freeGrid);
      }

      // Reset drag state
      setIsDragging(false);
      setDragPosition(null);
      setPreviewGridPosition(null);
      dragStartPosRef.current = null;
      dragMouseStartRef.current = null;
      setDraggingIcon(null); // Clear dragging icon from store
      
      // Restore cursor and user selection
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Remove classes
      document.body.classList.remove('icon-dragging', 'icon-dragging-over-window', 'icon-dragging-over-icon');
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Restore cursor and user selection in case component unmounts during drag
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Remove classes
      document.body.classList.remove('icon-dragging', 'icon-dragging-over-window', 'icon-dragging-over-icon');
    };
  }, [
    isDragging,
    iconId,
    initialGridPosition,
    iconStates,
    onPositionChange,
    setDraggingIcon,
    windowStates,
    isPositionOverWindow,
    isPositionOverIcon,
  ]);

  // Get current display position (pixel position during drag, or calculated from grid when not dragging)
  const displayPosition = isDragging && dragPosition
    ? dragPosition
    : gridToPixel(initialGridPosition.gridX, initialGridPosition.gridY);

  // Get preview pixel position (where icon will snap to)
  const previewPixelPosition = previewGridPosition
    ? gridToPixel(previewGridPosition.gridX, previewGridPosition.gridY)
    : null;

  return {
    displayPosition,
    isDragging,
    handleMouseDown,
    previewGridPosition,
    previewPixelPosition,
    initialPixelPosition,
  };
}

