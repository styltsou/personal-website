/**
 * Desktop Icons Container Component
 * Manages icon grid layout and renders all desktop icons
 */

import { useEffect, useRef, useCallback } from 'react';
import { icons } from '../data/icons';
import DesktopIcon from './desktop-icon';
import { useIconStore } from '../stores/icon-store';
import { calculateGridDimensions, gridToPixel } from '../utils/icon-grid';
import { BASE_Z_INDEX } from '../utils/window-utils';
import type { GridPosition } from '../utils/icon-grid';

export default function DesktopIcons() {
  const iconStates = useIconStore((state) => state.iconStates);
  const selectedIconId = useIconStore((state) => state.selectedIconId);
  const deselectIcons = useIconStore((state) => state.deselectIcons);
  const updateIconPosition = useIconStore((state) => state.updateIconPosition);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize icon positions with default positions if not present
  useEffect(() => {
    const { columns, rows } = calculateGridDimensions();

    icons.forEach((icon, index) => {
      const existingState = iconStates.find((is) => is.id === icon.id);
      if (!existingState) {
        // Place icons in a grid pattern, starting from top-left
        // Spread them out with some spacing
        const gridX = index % Math.max(1, Math.floor(columns / 3));
        const gridY = Math.floor(index / Math.max(1, Math.floor(columns / 3)));

        // Ensure position is within bounds
        const constrainedGridX = Math.min(gridX, columns - 1);
        const constrainedGridY = Math.min(gridY, rows - 1);

        updateIconPosition(icon.id, {
          gridX: constrainedGridX,
          gridY: constrainedGridY,
        });
      }
    });
  }, []); // Only run once on mount

  // Handle click outside to deselect icons
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      // Only deselect if clicking directly on container (not on an icon)
      if (e.target === containerRef.current) {
        deselectIcons();
      }
    },
    [deselectIcons]
  );

  // Get grid position for an icon (from store or default)
  const getIconGridPosition = (iconId: string): GridPosition => {
    const iconState = iconStates.find((is) => is.id === iconId);
    if (iconState) {
      return iconState.position;
    }
    // Default position (will be set by initialization effect)
    return { gridX: 0, gridY: 0 };
  };

  // Handle double-click on icon (future: open window)
  const handleIconDoubleClick = useCallback((iconId: string) => {
    // TODO: Open window when windowId is configured
    // For now, this is a placeholder for future functionality
    console.log(`Double-clicked icon: ${iconId}`);
  }, []);

  // Icon z-index should be below windows (BASE_Z_INDEX = 1000)
  const ICON_Z_INDEX = BASE_Z_INDEX - 100; // 900

  return (
    <div
      ref={containerRef}
      className="desktop-icon-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: ICON_Z_INDEX,
        pointerEvents: 'auto', // Container captures clicks for deselection
      }}
      onClick={(e) => {
        // Only deselect if clicking directly on container (not on an icon)
        if (e.target === containerRef.current) {
          handleContainerClick(e);
        }
      }}
    >
      {icons.map((icon) => {
        const gridPosition = getIconGridPosition(icon.id);
        return (
          <DesktopIcon
            key={icon.id}
            iconConfig={icon}
            gridPosition={gridPosition}
            onDoubleClick={() => handleIconDoubleClick(icon.id)}
          />
        );
      })}
    </div>
  );
}

