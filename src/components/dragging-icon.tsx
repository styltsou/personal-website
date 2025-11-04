/**
 * Dragging Icon Component
 * Renders the icon being dragged at Desktop level (outside icon container)
 * This ensures it appears above windows despite stacking context issues
 */

import { useIconStore } from '../stores/icon-store';
import { icons, type IconConfig } from '../data/icons';
import { ICON_WIDTH, ICON_HEIGHT, ICON_IMAGE_SIZE } from '../utils/icon-grid';

export default function DraggingIcon() {
  const draggingIconId = useIconStore((state) => state.draggingIconId);
  const draggingIconPosition = useIconStore((state) => state.draggingIconPosition);

  if (!draggingIconId || !draggingIconPosition) {
    return null;
  }

  const iconConfig = icons.find((icon) => icon.id === draggingIconId) as IconConfig | undefined;
  if (!iconConfig) {
    return null;
  }

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
    <div
      className="desktop-icon desktop-icon--dragging"
      style={{
        position: 'absolute',
        left: `${draggingIconPosition.x}px`,
        top: `${draggingIconPosition.y}px`,
        width: `${ICON_WIDTH}px`,
        height: `${ICON_HEIGHT}px`,
        transition: 'none', // No transitions - instant snap like real OS
        zIndex: 99, // Above all windows (10-98) but below menu bar (100)
        pointerEvents: 'none', // Don't block interactions
      }}
    >
      {renderIcon()}
      <div className="desktop-icon-label">{iconConfig.label}</div>
    </div>
  );
}

