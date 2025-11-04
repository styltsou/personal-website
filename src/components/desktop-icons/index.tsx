/**
 * Desktop Icons Container Component
 * Manages icon grid layout and renders all desktop icons
 */

import { useEffect, useRef, useCallback } from 'react';
import { icons } from '../../data/icons';
import DesktopIcon from '../desktop-icon';
import { useIconStore } from '../../stores/icon-store';
import { useWindowStore } from '../../stores/window-store';
import { calculateGridDimensions, gridToPixel } from '../../utils/icon-grid';
import { BASE_Z_INDEX } from '../../utils/window-utils';
import type { GridPosition } from '../../utils/icon-grid';

export default function DesktopIcons() {
  const iconStates = useIconStore((state) => state.iconStates);
  const selectedIconId = useIconStore((state) => state.selectedIconId);
  const deselectIcons = useIconStore((state) => state.deselectIcons);
  const updateIconPosition = useIconStore((state) => state.updateIconPosition);
  const openWindow = useWindowStore((state) => state.openWindow);
  const unfocusWindow = useWindowStore((state) => state.unfocusWindow);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize icon positions with default positions if not present
  // Run after persistence has loaded (when iconStates changes)
  useEffect(() => {
    const { columns } = calculateGridDimensions();

    icons.forEach((icon, index) => {
      const existingState = iconStates.find((is) => is.id === icon.id);
      if (!existingState) {
        // Place icons in a grid pattern, starting from top-left
        // Spread them horizontally with spacing
        // Use columns per row instead of columns/3 to spread them better
        const iconsPerRow = Math.max(4, Math.floor(columns / 2)); // At least 4 icons per row, or half of columns
        const gridX = index % iconsPerRow;
        const gridY = Math.floor(index / iconsPerRow);

        // Ensure position is within bounds
        const constrainedGridX = Math.min(gridX, columns - 1);
        const constrainedGridY = Math.max(0, gridY); // Ensure non-negative

        updateIconPosition(icon.id, {
          gridX: constrainedGridX,
          gridY: constrainedGridY,
        });
      }
    });
  }, [iconStates, updateIconPosition]); // Run when iconStates or updateIconPosition changes

  // Handle click outside to deselect icons and unfocus windows
  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      // Only deselect if clicking directly on container (not on an icon)
      if (e.target === containerRef.current) {
        deselectIcons();
        unfocusWindow(); // Deselect active window when clicking desktop background
      }
    },
    [deselectIcons, unfocusWindow]
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

  // Handle double-click on icon - open window if windowId is configured
  const handleIconDoubleClick = useCallback((iconId: string) => {
    const icon = icons.find((i) => i.id === iconId);
    if (icon?.windowId) {
      openWindow(icon.windowId);
    }
  }, [openWindow]);

  // Icon z-index should be below windows (BASE_Z_INDEX = 10)
  const ICON_Z_INDEX = 1; // Desktop icons stay on desktop surface

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

