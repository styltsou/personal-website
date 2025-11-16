/**
 * Desktop Icons Container Component
 * Manages icon grid layout and renders all desktop icons
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { apps } from '@/app-config';
import DesktopIcon from './desktop-icon';
import { useStore } from '@/store';
import { calculateGridDimensions, gridToPixel } from './utils';
import { BASE_Z_INDEX } from '@/constants';
import type { GridPosition, IconConfig } from '@/types/icon';
import styles from './styles.module.scss';

/**
 * Generate icons array from apps config
 * Only includes apps that have desktopIcon configured
 */
export function getDesktopIcons(): IconConfig[] {
  // Only compute on client side to avoid SSR issues
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return apps
      .filter((app) => app.desktopIcon)
      .map((app) => ({
        id: app.id,
        label: app.desktopIcon!.label ?? app.title, // Use app title as fallback
        icon: app.desktopIcon!.icon,
        windowId: app.id,
      }));
  } catch (error) {
    console.warn('Failed to load desktop icons:', error);
    return [];
  }
}

export default function DesktopIcons() {
  const iconStates = useStore((state) => state.iconStates);
  const selectedIconId = useStore((state) => state.selectedIconId);
  const deselectIcons = useStore((state) => state.deselectIcons);
  const updateIconPosition = useStore((state) => state.updateIconPosition);
  const openWindow = useStore((state) => state.openWindow);
  const unfocusWindow = useStore((state) => state.unfocusWindow);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate icons from apps config
  const icons = useMemo(() => getDesktopIcons(), []);

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
  }, [icons, iconStates, updateIconPosition]); // Run when icons, iconStates or updateIconPosition changes

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
  const handleIconDoubleClick = useCallback(
    (iconId: string) => {
      const icon = icons.find((i) => i.id === iconId);
      if (icon?.windowId) {
        openWindow(icon.windowId);
      }
    },
    [openWindow]
  );

  // Icon z-index should be below windows (BASE_Z_INDEX = 10)
  const ICON_Z_INDEX = 1; // Desktop icons stay on desktop surface

  return (
    <div
      ref={containerRef}
      className={styles.iconContainer}
      style={{
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
