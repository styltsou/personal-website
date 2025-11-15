/**
 * Desktop Icon Component
 * Individual icon component with drag, select, and double-click handlers
 */

import { useCallback, useRef } from 'react';
import { useIconDrag } from '@/hooks/use-icon-drag';
import { useStore } from '@/store';
import type { IconConfig, GridPosition } from '@/types/icon';
import {
  ICON_WIDTH,
  ICON_HEIGHT,
  ICON_IMAGE_SIZE,
} from '../utils';
import { cn } from '@/utils/cn';

export interface DesktopIconProps {
  iconConfig: IconConfig;
  gridPosition: GridPosition;
  onDoubleClick?: () => void;
}

export default function DesktopIcon({
  iconConfig,
  gridPosition,
  onDoubleClick,
}: DesktopIconProps) {
  const selectedIconId = useStore((state) => state.selectedIconId);
  const selectIcon = useStore((state) => state.selectIcon);
  const updateIconPosition = useStore((state) => state.updateIconPosition);
  const unfocusWindow = useStore((state) => state.unfocusWindow);
  const doubleClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSelected = selectedIconId === iconConfig.id;

  // Handle position change from drag
  const handlePositionChange = useCallback(
    (newGridPosition: GridPosition) => {
      updateIconPosition(iconConfig.id, newGridPosition);
    },
    [iconConfig.id, updateIconPosition]
  );

  // Use drag hook
  const {
    displayPosition,
    isDragging,
    handleMouseDown,
    previewPixelPosition,
    initialPixelPosition,
  } = useIconDrag({
    iconId: iconConfig.id,
    initialGridPosition: gridPosition,
    onPositionChange: handlePositionChange,
  });

  // Handle click (select)
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Only select if we didn't drag
      if (!isDragging) {
        selectIcon(iconConfig.id);
        unfocusWindow();
      }
    },
    [iconConfig.id, selectIcon, unfocusWindow, isDragging]
  );

  // Handle double-click
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      // Clear any pending single-click timer
      if (doubleClickTimerRef.current) {
        clearTimeout(doubleClickTimerRef.current);
        doubleClickTimerRef.current = null;
      }

      // Call double-click handler if provided
      if (onDoubleClick) {
        onDoubleClick();
      }
    },
    [onDoubleClick]
  );

  // Render icon (SVG or img element)
  const renderIcon = () => {
    if (typeof iconConfig.icon === 'string') {
      // Image path
      return (
        <img
          src={iconConfig.icon}
          alt={iconConfig.label}
          className="desktop-icon-image"
          width={ICON_IMAGE_SIZE}
          height={ICON_IMAGE_SIZE}
        />
      );
    } else {
      // Function that returns ReactNode (SVG component)
      const IconComponent = iconConfig.icon;
      return (
        <div className="desktop-icon-image">
          <IconComponent />
        </div>
      );
    }
  };

  return (
    <>
      {/* Original position ghost (only visible while dragging) */}
      {isDragging && (
        <div
          className={cn('desktop-icon', 'desktop-icon--ghost')}
          style={{
            position: 'absolute',
            left: `${initialPixelPosition.x}px`,
            top: `${initialPixelPosition.y}px`,
            width: `${ICON_WIDTH}px`,
            height: `${ICON_HEIGHT}px`,
            pointerEvents: 'none',
          }}
        >
          {renderIcon()}
          <div className="desktop-icon-label">{iconConfig.label}</div>
        </div>
      )}

      {/* Preview position (where icon will snap to) - just the outline box */}
      {isDragging && previewPixelPosition && (
        <div
          className={cn('desktop-icon', 'desktop-icon--preview')}
          style={{
            position: 'absolute',
            left: `${previewPixelPosition.x}px`,
            top: `${previewPixelPosition.y}px`,
            width: `${ICON_WIDTH}px`,
            height: `${ICON_HEIGHT}px`,
            pointerEvents: 'none',
          }}
        >
          {/* Preview is just the outline, no icon content */}
        </div>
      )}

      {/* Main icon (follows cursor while dragging, normal position otherwise) */}
      {/* When dragging, hide the icon here - it will be rendered at Desktop level */}
      {!isDragging && (
        <div
          className={cn('desktop-icon', isSelected && 'desktop-icon--selected')}
          style={{
            position: 'absolute',
            left: `${displayPosition.x}px`,
            top: `${displayPosition.y}px`,
            width: `${ICON_WIDTH}px`,
            height: `${ICON_HEIGHT}px`,
            transition: 'none', // No transitions - instant snap like real OS
          }}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          role="button"
          tabIndex={0}
          aria-label={`${iconConfig.label} icon`}
        >
          {renderIcon()}
          <div className="desktop-icon-label">{iconConfig.label}</div>
        </div>
      )}
    </>
  );
}
