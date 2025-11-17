/**
 * Resize Handles Component
 * Eight resize handles (corners and edges) for window resizing
 */

import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export interface ResizeHandlesProps {
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
  resizable?: boolean; // Whether window can be resized (default: true)
}

export default function ResizeHandles({
  onResizeStart,
  resizable = true,
}: ResizeHandlesProps) {
  // Don't render any handles if resizing is disabled
  if (!resizable) {
    return null;
  }

  // Check if an icon is being dragged
  const draggingIconId = useStore((state) => state.draggingIconId);
  const isIconDragging = draggingIconId !== null;

  // When dragging an icon, use grabbing cursor instead of resize cursors
  const getCursor = (resizeCursor: string) => {
    if (isIconDragging) {
      return 'grabbing'; // Icon is being dragged, show grabbing cursor
    }
    return resizeCursor; // Normal resize cursor
  };

  // Show all handles when resizable is true
  const showCornerHandles = true;
  const showEdgeHandles = true;

  return (
    <>
      {/* Corner handles - always shown */}
      {showCornerHandles && (
        <>
          <div
            className={cn(styles.resizeHandle, styles.resizeHandleNw)}
            onMouseDown={(e) => onResizeStart(e, 'nw')}
            style={{ cursor: getCursor('nwse-resize') }}
          />
          <div
            className={cn(styles.resizeHandle, styles.resizeHandleNe)}
            onMouseDown={(e) => onResizeStart(e, 'ne')}
            style={{ cursor: getCursor('nesw-resize') }}
          />
          <div
            className={cn(styles.resizeHandle, styles.resizeHandleSw)}
            onMouseDown={(e) => onResizeStart(e, 'sw')}
            style={{ cursor: getCursor('nesw-resize') }}
          />
          <div
            className={cn(styles.resizeHandle, styles.resizeHandleSe)}
            onMouseDown={(e) => onResizeStart(e, 'se')}
            style={{ cursor: getCursor('nwse-resize') }}
          />
        </>
      )}
      {/* Edge handles - hidden when constraint is 'diagonal' */}
      {showEdgeHandles && (
        <>
          <div
            className={cn(styles.resizeHandle, styles.resizeHandleN)}
            onMouseDown={(e) => onResizeStart(e, 'n')}
            style={{ cursor: getCursor('ns-resize') }}
          />
          <div
            className={cn(styles.resizeHandle, styles.resizeHandleS)}
            onMouseDown={(e) => onResizeStart(e, 's')}
            style={{ cursor: getCursor('ns-resize') }}
          />
          <div
            className={cn(styles.resizeHandle, styles.resizeHandleW)}
            onMouseDown={(e) => onResizeStart(e, 'w')}
            style={{ cursor: getCursor('ew-resize') }}
          />
          <div
            className={cn(styles.resizeHandle, styles.resizeHandleE)}
            onMouseDown={(e) => onResizeStart(e, 'e')}
            style={{ cursor: getCursor('ew-resize') }}
          />
        </>
      )}
    </>
  );
}
