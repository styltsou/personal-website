# Window Management System

This document explains how the window management system works, including window lifecycle, state management, positioning, and interactions.

## Overview

The window management system is built on Zustand for state management and provides a desktop-like experience with draggable, resizable windows that can be minimized, maximized, and snapped to edges.

## Core Concepts

### Window State

Each window has a `WindowState` that includes:
- `id` - Unique identifier (matches app ID)
- `config` - App configuration from `app-config.ts`
- `position` - Current position (x, y)
- `size` - Current size (width, height)
- `zIndex` - Stacking order
- `isMinimized` - Whether window is minimized
- `isMaximized` - Whether window is maximized
- `snapSide` - Which edge the window is snapped to (left/right/top/null)
- `content` - HTML content for path-based windows (optional)

### Window Store

The `store/window/slice.ts` manages all window state using Zustand. It provides:

**State:**
- `windowStates` - Array of all open windows
- `closedWindows` - Map of closed window states (for restoration)
- `activeWindowId` - Currently focused window
- `nextZIndex` - Next available z-index
- `hasLoadedFromPersistence` - Whether state has been restored from sessionStorage

**Actions:**
- `openWindow(id)` - Open or restore a window
- `closeWindow(id)` - Close a window (saves state for restoration)
- `minimizeWindow(id)` - Minimize a window
- `maximizeWindow(id)` - Toggle maximize/restore
- `focusWindow(id)` - Bring window to front
- `updateWindowPosition(id, position)` - Update window position
- `updateWindowSize(id, size)` - Update window size
- `snapWindow(id, side)` - Snap window to edge
- `unsnapWindow(id)` - Unsnap window

## Window Lifecycle

### Opening a Window

1. **Check if already open**: If window exists in `windowStates`, bring to front and restore if minimized
2. **Check closed state**: If window was previously closed, restore its position/size
3. **Calculate position**: Use cascading algorithm if other windows are visible, otherwise center
4. **Calculate z-index**: Bring to front (increment from current max)
5. **Create window state**: Add to `windowStates` array

### Closing a Window

1. **Save state**: Store position, size, and maximized state in `closedWindows`
2. **Remove from array**: Remove from `windowStates`
3. **Update active window**: Clear if it was the active window

### Window Restoration

When reopening a closed window:
- Restore exact position and size from `closedWindows`
- Restore maximized state if it was maximized
- Use cascading if no saved state exists

## Positioning System

### Centered Positioning

New windows are centered on screen with a slight vertical offset (15% of viewport height) to avoid covering the menu bar.

### Cascading

When multiple windows are open, new windows cascade:
- First window: Centered
- Subsequent windows: Offset by 40px right and 40px down
- Prevents windows from stacking exactly on top of each other

### Window Constraints

- **Minimum size**: 800x600px
- **Position bounds**: Windows cannot be moved completely off-screen
- **Size constraints**: Enforced during resize operations

## Z-Index Management

Simplified z-index system:
- **Base**: Windows start at z-index 10
- **Increment**: Each focus increments by 1
- **Maximum**: Capped at 98 (leaves room for dragging icons at 99 and menu bar at 100)
- **Active window**: Always has the highest z-index among windows

When a window is focused:
1. Find current maximum z-index
2. Calculate next z-index (max + 1, capped at 98)
3. Update window's z-index
4. Set as active window

## Window Interactions

### Dragging

- Handled by `use-window-drag.ts` hook
- Updates position in real-time during drag
- Respects viewport bounds
- Supports snap preview while dragging
- Updates store on drag end

### Resizing

- Handled by `use-window-resize.ts` hook
- Supports 8 resize handles (corners + edges)
- Enforces minimum size constraints
- Updates position when resizing from left/top edges
- Updates store on resize end

### Snapping

Windows can snap to screen edges:
- **Left**: Takes up left half of screen
- **Right**: Takes up right half of screen
- **Top**: Takes up top portion of screen

**Important**: Snapping is visual only - the actual position/size in the store remains unchanged. This allows unsnapping to restore the original position.

### Maximizing

When maximized:
- Window fills entire viewport (minus menu bar)
- Actual position/size in store unchanged
- Component overrides display size/position
- Unmaximizing restores original position/size

## Window Content

### Content-Based Windows

Windows with a `path` property (e.g., `/about`, `/projects`):
- Content is loaded from the corresponding Astro page
- HTML is fetched and parsed to extract `<main>` content
- Content is cached to avoid re-fetching
- Loading state is tracked and displayed

### Component-Based Windows

Windows with a `component` property:
- Render the React component directly
- No content loading needed
- Examples: Terminal, Music Player, Piano

## Persistence

Window state is persisted to `sessionStorage`:
- Saves on every state change
- Restores on page reload
- Includes position, size, z-index, minimized/maximized state
- **Important**: Component references are lost during JSON serialization, so they're restored from `app-config.ts` on load

See `use-window-persistence.ts` for implementation details.

## URL Synchronization

Window state is synchronized with browser URL:
- Opening a window with a `path` updates URL
- Browser back/forward navigation opens/closes windows
- URL changes trigger window state updates

See `use-url-sync.ts` for implementation details.

## Performance Considerations

1. **Memoization**: Window actions object is memoized to prevent unnecessary re-renders
2. **Selective updates**: Only affected windows re-render on state changes
3. **Zustand selectors**: Individual selectors prevent unnecessary subscriptions
4. **Content caching**: Path-based content is cached after first load

## Key Files

- `src/store/window/slice.ts` - Window state management
- `src/components/window/index.tsx` - Window component
- `src/hooks/use-window-drag.ts` - Dragging logic
- `src/hooks/use-window-resize.ts` - Resizing logic
- `src/components/window/utils/window-utils.ts` - Positioning and calculation utilities
- `src/components/window/utils/viewport-constraints.ts` - Viewport constraint utilities
- `src/types/window.ts` - Window type definitions (`WindowPosition`, `WindowSize`, `WindowState`, etc.)

