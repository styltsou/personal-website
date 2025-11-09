/**
 * Resize Handles Component
 * Eight resize handles (corners and edges) for window resizing
 */

import { useIconStore } from '../../stores/icon-store';

export interface ResizeHandlesProps {
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

export default function ResizeHandles({ onResizeStart }: ResizeHandlesProps) {
  // Check if an icon is being dragged
  const draggingIconId = useIconStore((state) => state.draggingIconId);
  const isIconDragging = draggingIconId !== null;

  // When dragging an icon, use grabbing cursor instead of resize cursors
  const getCursor = (resizeCursor: string) => {
    if (isIconDragging) {
      return 'grabbing'; // Icon is being dragged, show grabbing cursor
    }
    return resizeCursor; // Normal resize cursor
  };

  return (
    <>
      {/* Corner handles */}
      <div
        className="retro-resize-handle retro-resize-handle-nw"
        onMouseDown={(e) => onResizeStart(e, 'nw')}
        style={{ cursor: getCursor('nwse-resize') }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-ne"
        onMouseDown={(e) => onResizeStart(e, 'ne')}
        style={{ cursor: getCursor('nesw-resize') }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-sw"
        onMouseDown={(e) => onResizeStart(e, 'sw')}
        style={{ cursor: getCursor('nesw-resize') }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-se"
        onMouseDown={(e) => onResizeStart(e, 'se')}
        style={{ cursor: getCursor('nwse-resize') }}
      />
      {/* Edge handles */}
      <div
        className="retro-resize-handle retro-resize-handle-n"
        onMouseDown={(e) => onResizeStart(e, 'n')}
        style={{ cursor: getCursor('ns-resize') }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-s"
        onMouseDown={(e) => onResizeStart(e, 's')}
        style={{ cursor: getCursor('ns-resize') }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-w"
        onMouseDown={(e) => onResizeStart(e, 'w')}
        style={{ cursor: getCursor('ew-resize') }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-e"
        onMouseDown={(e) => onResizeStart(e, 'e')}
        style={{ cursor: getCursor('ew-resize') }}
      />
    </>
  );
}
