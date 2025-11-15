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
import { useStore } from '../store';
import { getSnappedPreview, MENU_BAR_HEIGHT } from '../utils/window-utils';

export interface UseIconDragOptions {
  iconId: string;
  initialGridPosition: GridPosition;
  onPositionChange: (gridPosition: GridPosition) => void;
}

const DRAG_THRESHOLD = 5; // Pixels of movement required to start dragging

export function useIconDrag({
  iconId,
  initialGridPosition,
  onPositionChange,
}: UseIconDragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPotentialDrag, setIsPotentialDrag] = useState(false); // Track if mousedown happened
  const [dragPosition, setDragPosition] = useState<PixelPosition | null>(null);
  const [previewGridPosition, setPreviewGridPosition] =
    useState<GridPosition | null>(null);

  // Refs for drag state
  const dragStartPosRef = useRef<PixelPosition | null>(null);
  const dragMouseStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasStartedDragRef = useRef(false); // Track if we've crossed the threshold

  // Get all icon states from store for collision detection
  const iconStates = useStore((state) => state.iconStates);
  const setDraggingIcon = useStore((state) => state.setDraggingIcon);
  const windowStates = useStore((state) => state.windowStates);

  // Helper function to check if icon position overlaps with another icon
  const isPositionOverIcon = useCallback(
    (iconPos: PixelPosition): boolean => {
      const snappedGrid = snapToGrid(iconPos.x, iconPos.y);
      const constrainedGrid = constrainGridPosition(
        snappedGrid.gridX,
        snappedGrid.gridY
      );
      const occupiedCells = getOccupiedCells(
        iconStates
          .filter((state) => state.id !== iconId)
          .map((state) => state.position)
      );
      const targetCellKey = `${constrainedGrid.gridX},${constrainedGrid.gridY}`;
      return occupiedCells.has(targetCellKey);
    },
    [iconId, iconStates]
  );

  // Helper function to check if icon position overlaps with any window
  const isPositionOverWindow = useCallback(
    (iconPos: PixelPosition): boolean => {
      const iconCenterX = iconPos.x + ICON_WIDTH / 2;
      const iconCenterY = iconPos.y + ICON_HEIGHT / 2;

      return windowStates.some((ws) => {
        if (ws.isMinimized) return false;

        let windowX: number,
          windowY: number,
          windowWidth: number,
          windowHeight: number;

        if (ws.isMaximized) {
          windowX = 0;
          windowY = MENU_BAR_HEIGHT;
          windowWidth = window.innerWidth;
          windowHeight = window.innerHeight - MENU_BAR_HEIGHT;
        } else if (ws.snapSide) {
          const snapped = getSnappedPreview(ws.snapSide);
          windowX = snapped.position.x;
          windowY = snapped.position.y;
          windowWidth = snapped.size.width;
          windowHeight = snapped.size.height;
        } else {
          windowX = ws.position.x;
          windowY = ws.position.y;
          windowWidth = ws.size.width;
          windowHeight = ws.size.height;
        }

        return (
          iconCenterX >= windowX &&
          iconCenterX <= windowX + windowWidth &&
          iconCenterY >= windowY &&
          iconCenterY <= windowY + windowHeight
        );
      });
    },
    [windowStates]
  );

  // Convert initial grid position to pixel position
  const initialPixelPosition = gridToPixel(
    initialGridPosition.gridX,
    initialGridPosition.gridY
  );

  // Handle mousedown - just record position, don't start dragging yet
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const currentPixelPos = gridToPixel(
        initialGridPosition.gridX,
        initialGridPosition.gridY
      );

      dragStartPosRef.current = { ...currentPixelPos };
      dragMouseStartRef.current = { x: e.clientX, y: e.clientY };
      hasStartedDragRef.current = false;
      setIsPotentialDrag(true); // This will trigger the effect to attach listeners
    },
    [initialGridPosition]
  );

  // Handle drag movement and end
  useEffect(() => {
    if (
      !isPotentialDrag ||
      !dragStartPosRef.current ||
      !dragMouseStartRef.current
    ) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragMouseStartRef.current) return;

      const deltaX = e.clientX - dragMouseStartRef.current.x;
      const deltaY = e.clientY - dragMouseStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Start dragging only if we've moved beyond threshold
      if (!hasStartedDragRef.current && distance > DRAG_THRESHOLD) {
        hasStartedDragRef.current = true;
        setIsDragging(true);
        setDraggingIcon(iconId, dragStartPosRef.current!);
        e.preventDefault();
        e.stopPropagation();
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        document.body.classList.add('icon-dragging');
      }

      // Only update position if we're actually dragging
      if (hasStartedDragRef.current && dragStartPosRef.current) {
        const newPosition: PixelPosition = {
          x: dragStartPosRef.current.x + deltaX,
          y: dragStartPosRef.current.y + deltaY,
        };

        const constrainedPosition = constrainToViewport(newPosition);
        setDragPosition(constrainedPosition);
        setDraggingIcon(iconId, constrainedPosition);

        // Update cursor and preview
        const overWindow = isPositionOverWindow(constrainedPosition);
        const overIcon = isPositionOverIcon(constrainedPosition);

        if (overWindow || overIcon) {
          document.body.style.cursor = 'not-allowed';
          setPreviewGridPosition(null);
        } else {
          document.body.style.cursor = 'grabbing';
          const snappedGrid = snapToGrid(
            constrainedPosition.x,
            constrainedPosition.y
          );
          const constrainedGrid = constrainGridPosition(
            snappedGrid.gridX,
            snappedGrid.gridY
          );
          const occupiedCells = getOccupiedCells(
            iconStates
              .filter((state) => state.id !== iconId)
              .map((state) => state.position)
          );
          const freeGrid = findNearestFreeCell(
            constrainedGrid.gridX,
            constrainedGrid.gridY,
            occupiedCells,
            initialGridPosition.gridX,
            initialGridPosition.gridY
          );
          setPreviewGridPosition(freeGrid);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Only process drop if we were actually dragging
      if (
        hasStartedDragRef.current &&
        dragStartPosRef.current &&
        dragMouseStartRef.current
      ) {
        const deltaX = e.clientX - dragMouseStartRef.current.x;
        const deltaY = e.clientY - dragMouseStartRef.current.y;

        const finalPosition: PixelPosition = {
          x: dragStartPosRef.current.x + deltaX,
          y: dragStartPosRef.current.y + deltaY,
        };

        const constrainedFinalPosition = constrainToViewport(finalPosition);
        const snappedGrid = snapToGrid(
          constrainedFinalPosition.x,
          constrainedFinalPosition.y
        );
        const constrainedGrid = constrainGridPosition(
          snappedGrid.gridX,
          snappedGrid.gridY
        );
        const occupiedCells = getOccupiedCells(
          iconStates
            .filter((state) => state.id !== iconId)
            .map((state) => state.position)
        );
        const freeGrid = findNearestFreeCell(
          constrainedGrid.gridX,
          constrainedGrid.gridY,
          occupiedCells,
          initialGridPosition.gridX,
          initialGridPosition.gridY
        );

        const freeGridPixelPos = gridToPixel(freeGrid.gridX, freeGrid.gridY);
        if (!isPositionOverWindow(freeGridPixelPos)) {
          onPositionChange(freeGrid);
        }
      }

      // Reset everything
      hasStartedDragRef.current = false;
      setIsDragging(false);
      setIsPotentialDrag(false);
      setDragPosition(null);
      setPreviewGridPosition(null);
      dragStartPosRef.current = null;
      dragMouseStartRef.current = null;
      setDraggingIcon(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove(
        'icon-dragging',
        'icon-dragging-over-window',
        'icon-dragging-over-icon'
      );
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Cleanup
      hasStartedDragRef.current = false;
      setIsPotentialDrag(false);
      setDraggingIcon(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.classList.remove(
        'icon-dragging',
        'icon-dragging-over-window',
        'icon-dragging-over-icon'
      );
    };
  }, [
    isPotentialDrag,
    iconId,
    initialGridPosition,
    iconStates,
    onPositionChange,
    setDraggingIcon,
    isPositionOverWindow,
    isPositionOverIcon,
  ]);

  // Get current display position
  const displayPosition =
    isDragging && dragPosition
      ? dragPosition
      : gridToPixel(initialGridPosition.gridX, initialGridPosition.gridY);

  // Get preview pixel position
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
