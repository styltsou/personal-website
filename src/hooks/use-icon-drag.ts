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
  type PixelPosition,
  type GridPosition,
} from '../utils/icon-grid';
import { useIconStore, type IconState } from '../stores/icon-store';

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
    },
    [initialGridPosition, isDragging]
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

      // Update position via callback
      onPositionChange(freeGrid);

      // Reset drag state
      setIsDragging(false);
      setDragPosition(null);
      setPreviewGridPosition(null);
      dragStartPosRef.current = null;
      dragMouseStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    iconId,
    initialGridPosition,
    iconStates,
    onPositionChange,
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

