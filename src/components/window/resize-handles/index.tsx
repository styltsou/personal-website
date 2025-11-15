/**
 * Resize Handles Component
 * Eight resize handles (corners and edges) for window resizing
 */

import { useStore } from '@/store';
import type { ResizeConstraint } from '@/types/window';

export interface ResizeHandlesProps {
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
  constraint?: ResizeConstraint; // Resize constraint: 'none' (full resize, default), 'diagonal' (corners only), 'disabled' (no resize)
}

export default function ResizeHandles({
  onResizeStart,
  constraint = 'none',
}: ResizeHandlesProps) {
  // Don't render any handles if resizing is disabled
  if (constraint === 'disabled') {
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

  // Determine which handles to show
  // 'none' means no constraint (full resize - all handles)
  // 'diagonal' means only corner handles
  const showCornerHandles = true; // Always show corners
  const showEdgeHandles = constraint !== 'diagonal'; // Only hide edges when constraint is 'diagonal'

  return (
    <>
      {/* Corner handles - always shown */}
      {showCornerHandles && (
        <>
          <div
            className="resize-handle resize-handle-nw"
            onMouseDown={(e) => onResizeStart(e, 'nw')}
            style={{ cursor: getCursor('nwse-resize') }}
          />
          <div
            className="resize-handle resize-handle-ne"
            onMouseDown={(e) => onResizeStart(e, 'ne')}
            style={{ cursor: getCursor('nesw-resize') }}
          />
          <div
            className="resize-handle resize-handle-sw"
            onMouseDown={(e) => onResizeStart(e, 'sw')}
            style={{ cursor: getCursor('nesw-resize') }}
          />
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={(e) => onResizeStart(e, 'se')}
            style={{ cursor: getCursor('nwse-resize') }}
          />
        </>
      )}
      {/* Edge handles - hidden when constraint is 'diagonal' */}
      {showEdgeHandles && (
        <>
          <div
            className="resize-handle resize-handle-n"
            onMouseDown={(e) => onResizeStart(e, 'n')}
            style={{ cursor: getCursor('ns-resize') }}
          />
          <div
            className="resize-handle resize-handle-s"
            onMouseDown={(e) => onResizeStart(e, 's')}
            style={{ cursor: getCursor('ns-resize') }}
          />
          <div
            className="resize-handle resize-handle-w"
            onMouseDown={(e) => onResizeStart(e, 'w')}
            style={{ cursor: getCursor('ew-resize') }}
          />
          <div
            className="resize-handle resize-handle-e"
            onMouseDown={(e) => onResizeStart(e, 'e')}
            style={{ cursor: getCursor('ew-resize') }}
          />
        </>
      )}
    </>
  );
}
