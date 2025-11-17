/**
 * Dragging Icon Component
 * Renders the icon being dragged at Desktop level (outside icon container)
 * This ensures it appears above windows despite stacking context issues
 */

import { useStore } from '@/store';
import { getDesktopIcons } from '..';
import type { IconConfig } from '@/types/icon';
import {
  ICON_WIDTH,
  ICON_HEIGHT,
  ICON_IMAGE_SIZE,
} from '@/components/desktop-icons/utils';
import { cn } from '@/utils/cn';
import iconStyles from '../desktop-icon/styles.module.scss';
import styles from './styles.module.scss';

export default function DraggingIcon() {
  const draggingIconId = useStore(state => state.draggingIconId);
  const draggingIconPosition = useStore(state => state.draggingIconPosition);

  if (!draggingIconId || !draggingIconPosition) {
    return null;
  }

  const icons = getDesktopIcons();
  const iconConfig = icons.find(icon => icon.id === draggingIconId) as
    | IconConfig
    | undefined;
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
          className={iconStyles.desktopIconImage}
          width={ICON_IMAGE_SIZE}
          height={ICON_IMAGE_SIZE}
        />
      );
    } else {
      // Function that returns ReactNode (SVG component)
      const IconComponent = iconConfig.icon;
      return (
        <div className={iconStyles.desktopIconImage}>
          <IconComponent />
        </div>
      );
    }
  };

  return (
    <div
      className={cn(
        'desktop-icon',
        iconStyles.desktopIcon,
        iconStyles.desktopIconDragging,
        styles.draggingIcon
      )}
      style={{
        left: `${draggingIconPosition.x}px`,
        top: `${draggingIconPosition.y}px`,
        width: `${ICON_WIDTH}px`,
        height: `${ICON_HEIGHT}px`,
      }}
    >
      {renderIcon()}
      <div className={iconStyles.desktopIconLabel}>{iconConfig.label}</div>
    </div>
  );
}
