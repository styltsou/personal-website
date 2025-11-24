/**
 * Resize Handles Component
 * Eight resize handles (corners and edges) for window resizing
 */

import { useStore } from '@/store';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export interface ResizeHandlesProps {
  onResizeStart: (e: React.MouseEvent, handle: string) => void;
}

export default function ResizeHandles({ onResizeStart }: ResizeHandlesProps) {
  // When dragging an icon, use grabbing cursor instead of resize cursors
  // TODO: Here instead of chekcing to change the grab cursor, we can put
  // that a level higher on the conditional rendering (and maybe we dont even need that)
  const draggingIconId = useStore(s => s.draggingIconId);
  const getCursor = (resizeCursor: string) =>
    !draggingIconId ? 'grabbing' : resizeCursor;

  // TODO: See if I can place resize logic directly here and not as a callback

  return (
    <>
      {/* Corner handles */}
      <div
        className={cn(styles.resizeHandle, styles.resizeHandleNw)}
        onMouseDown={e => onResizeStart(e, 'nw')}
        style={{ cursor: getCursor('nwse-resize') }}
      />
      <div
        className={cn(styles.resizeHandle, styles.resizeHandleNe)}
        onMouseDown={e => onResizeStart(e, 'ne')}
        style={{ cursor: getCursor('nesw-resize') }}
      />
      <div
        className={cn(styles.resizeHandle, styles.resizeHandleSw)}
        onMouseDown={e => onResizeStart(e, 'sw')}
        style={{ cursor: getCursor('nesw-resize') }}
      />
      <div
        className={cn(styles.resizeHandle, styles.resizeHandleSe)}
        onMouseDown={e => onResizeStart(e, 'se')}
        style={{ cursor: getCursor('nwse-resize') }}
      />
      {/* Edge handles */}
      <div
        className={cn(styles.resizeHandle, styles.resizeHandleN)}
        onMouseDown={e => onResizeStart(e, 'n')}
        style={{ cursor: getCursor('ns-resize') }}
      />
      <div
        className={cn(styles.resizeHandle, styles.resizeHandleS)}
        onMouseDown={e => onResizeStart(e, 's')}
        style={{ cursor: getCursor('ns-resize') }}
      />
      <div
        className={cn(styles.resizeHandle, styles.resizeHandleW)}
        onMouseDown={e => onResizeStart(e, 'w')}
        style={{ cursor: getCursor('ew-resize') }}
      />
      <div
        className={cn(styles.resizeHandle, styles.resizeHandleE)}
        onMouseDown={e => onResizeStart(e, 'e')}
        style={{ cursor: getCursor('ew-resize') }}
      />
    </>
  );
}
