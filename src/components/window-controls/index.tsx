/**
 * Window Controls Component
 * Minimize, Maximize/Restore, and Close buttons
 */

export interface WindowControlsProps {
  title: string;
  isMaximized: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function WindowControls({
  title,
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
}: WindowControlsProps) {
  return (
    <div
      className="retro-titlebar-controls"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Minimize Button */}
      {onMinimize && (
        <button
          type="button"
          className="retro-window-control retro-focus-ring"
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          aria-label={`Minimize ${title} window`}
        >
          _
        </button>
      )}
      {/* Maximize/Restore Button */}
      {onMaximize && (
        <button
          type="button"
          className="retro-window-control retro-focus-ring"
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          aria-label={`${isMaximized ? 'Restore' : 'Maximize'} ${title} window`}
        >
          {isMaximized ? '❐' : '□'}
        </button>
      )}
      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          className="retro-window-control retro-focus-ring"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label={`Close ${title} window`}
        >
          ×
        </button>
      )}
    </div>
  );
}
