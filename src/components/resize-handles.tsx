/**
 * Resize Handles Component
 * Eight resize handles (corners and edges) for window resizing
 */

export interface ResizeHandlesProps {
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

export default function ResizeHandles({
  onResizeStart,
}: ResizeHandlesProps) {
  return (
    <>
      {/* Corner handles */}
      <div
        className="retro-resize-handle retro-resize-handle-nw"
        onMouseDown={(e) => onResizeStart(e, 'nw')}
        style={{ cursor: 'nwse-resize' }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-ne"
        onMouseDown={(e) => onResizeStart(e, 'ne')}
        style={{ cursor: 'nesw-resize' }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-sw"
        onMouseDown={(e) => onResizeStart(e, 'sw')}
        style={{ cursor: 'nesw-resize' }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-se"
        onMouseDown={(e) => onResizeStart(e, 'se')}
        style={{ cursor: 'nwse-resize' }}
      />
      {/* Edge handles */}
      <div
        className="retro-resize-handle retro-resize-handle-n"
        onMouseDown={(e) => onResizeStart(e, 'n')}
        style={{ cursor: 'ns-resize' }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-s"
        onMouseDown={(e) => onResizeStart(e, 's')}
        style={{ cursor: 'ns-resize' }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-w"
        onMouseDown={(e) => onResizeStart(e, 'w')}
        style={{ cursor: 'ew-resize' }}
      />
      <div
        className="retro-resize-handle retro-resize-handle-e"
        onMouseDown={(e) => onResizeStart(e, 'e')}
        style={{ cursor: 'ew-resize' }}
      />
    </>
  );
}
