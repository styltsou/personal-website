# State Management

This document explains the state management architecture, including Zustand stores, persistence, and state synchronization.

## Overview

The application uses Zustand for state management, providing a lightweight, performant solution for managing window and icon state. State is persisted to browser storage and synchronized with the URL.

## Architecture

### Store Structure

Two main Zustand store slices:

1. **Window Store** (`store/window/slice.ts`): Manages all window-related state
2. **Icon Store** (`store/icon/slice.ts`): Manages all icon-related state

Both stores follow similar patterns:

- State properties
- Action methods
- Persistence integration
- Selector utilities

## Window Store

**Types**: Window-related types are defined in `src/types/window.ts`:

- `WindowState` - Complete window state
- `ClosedWindowState` - Closed window state (for persistence)
- `WindowPosition` - Window position coordinates
- `WindowSize` - Window size dimensions
- `SnapSide` - Window snap side
- `ResizeConstraint` - Resize behavior constraint

### State Properties

```typescript
import type { WindowState, ClosedWindowState } from '@/types/window';

interface WindowStore {
  windowStates: WindowState[]; // All open windows
  closedWindows: Record<string, ClosedWindowState>; // Closed window states
  activeWindowId: string | null; // Currently focused window
  nextZIndex: number; // Next available z-index
  hasLoadedFromPersistence: boolean; // Whether state restored
}
```

### Actions

All window operations go through store actions:

- `openWindow(id)` - Open/restore window
- `closeWindow(id)` - Close window (saves state)
- `minimizeWindow(id)` - Minimize window
- `maximizeWindow(id)` - Toggle maximize
- `focusWindow(id)` - Bring to front
- `updateWindowPosition(id, position)` - Update position
- `updateWindowSize(id, size)` - Update size
- `snapWindow(id, side)` - Snap to edge
- `unsnapWindow(id)` - Unsnap

### State Updates

Zustand's `set` function is used for updates:

```typescript
set(state => ({
  windowStates: state.windowStates.map(ws =>
    ws.id === windowId ? { ...ws, isMinimized: true } : ws
  ),
}));
```

**Immutability**: Always return new objects/arrays, never mutate state directly.

## Icon Store

**Types**: Icon-related types are defined in `src/types/icon.ts`:

- `IconState` - Icon state (id and position)
- `IconPosition` - Icon grid position
- `IconConfig` - Icon configuration
- `GridPosition` - Grid coordinates
- `PixelPosition` - Pixel coordinates
- `GridDimensions` - Grid dimensions

### State Properties

```typescript
import type { IconState } from '@/types/icon';

interface IconStore {
  iconStates: IconState[]; // Icon positions
  selectedIconId: string | null; // Selected icon
  draggingIconId: string | null; // Icon being dragged
  draggingIconPosition: { x: number; y: number } | null;
  hasLoadedFromPersistence: boolean;
}
```

### Actions

Icon operations:

- `updateIconPosition(id, position)` - Update grid position
- `selectIcon(id)` - Select icon
- `deselectIcons()` - Clear selection
- `setDraggingIcon(id, position)` - Set dragging state

## State Access Patterns

### Direct Access

```typescript
const windowStates = useWindowStore(state => state.windowStates);
const openWindow = useWindowStore(state => state.openWindow);
```

### Selector Pattern

For better performance, use individual selectors:

```typescript
// Good: Only subscribes to windowStates
const windowStates = useWindowStore(state => state.windowStates);

// Bad: Subscribes to entire store (causes unnecessary re-renders)
const store = useWindowStore();
```

### Action Access

Actions are stable references (don't change), so they're safe to use in dependencies:

```typescript
const openWindow = useWindowStore(state => state.openWindow);

useEffect(() => {
  openWindow('about');
}, [openWindow]); // Safe: openWindow is stable
```

## Persistence

### Window Persistence

**Storage**: `sessionStorage` (clears on tab close)

**Format**:

```typescript
{
  windowStates: WindowState[],
  closedWindows: Record<string, ClosedWindowState>,
  nextZIndex: number
}
```

**Process**:

1. State saved on every change (via `useEffect`)
2. On page load, state restored from `sessionStorage`
3. Component references restored from `app-config.ts` (lost during serialization)
4. Windows reappear in their previous positions

**Hook**: `use-window-persistence.ts`

### Icon Persistence

**Storage**: `localStorage` (persists across sessions)

**Format**:

```typescript
{
  [iconId: string]: {
    gridX: number,
    gridY: number
  }
}
```

**Process**:

1. Positions saved on every change
2. On page load, positions restored
3. Icons appear in their previous grid positions

**Hook**: `use-icon-persistence.ts`

## State Synchronization

### URL Synchronization

Window state is synchronized with browser URL:

**Window → URL**:

- Opening a window with a `path` updates URL
- Closing all windows resets URL to `/`

**URL → Window**:

- Browser back/forward navigation opens/closes windows
- Direct URL access opens corresponding window

**Implementation**: `use-url-sync.ts`

### Theme Synchronization

Theme preference is stored in `localStorage` and applied before React renders (blocking script in `BaseLayout.astro`).

## State Initialization

### Synchronous Initialization

Some state is initialized synchronously (before React renders):

**Window Store**:

```typescript
// Check if saved state exists
let initialHasLoadedFromPersistence = false;
if (typeof window !== 'undefined') {
  const saved = sessionStorage.getItem('desktop-windows');
  initialHasLoadedFromPersistence = !saved; // true if no saved state
}
```

**Why**: Prevents flash of empty content when no saved state exists.

### Asynchronous Restoration

When saved state exists:

1. Store starts with `hasLoadedFromPersistence: false`
2. `useWindowPersistence` hook loads state in `useEffect`
3. State is restored and `hasLoadedFromPersistence` set to `true`
4. Desktop fades in smoothly

## Performance Considerations

### 1. Selective Subscriptions

Use individual selectors to minimize re-renders:

```typescript
// Only re-renders when windowStates changes
const windowStates = useWindowStore(state => state.windowStates);
```

### 2. Memoization

Memoize derived values:

```typescript
const windowActions = useMemo(() => ({
  openWindow,
  closeWindow,
  // ...
}), [openWindow, closeWindow, ...]);
```

### 3. Stable References

Actions are stable (don't change), safe for dependencies:

```typescript
const openWindow = useWindowStore(state => state.openWindow);
// openWindow reference never changes
```

### 4. Batch Updates

Zustand batches updates automatically, but you can also batch manually:

```typescript
set((state) => ({
  windowStates: [...],
  activeWindowId: 'new-id',
  nextZIndex: state.nextZIndex + 1
})); // Single update, single re-render
```

## State Flow

### Opening a Window

1. **User Action**: Double-click icon or click menu item
2. **Action Call**: `openWindow('about')`
3. **Store Update**: Window added to `windowStates`
4. **Component Re-render**: Desktop component re-renders
5. **Window Rendered**: Window component appears
6. **Content Loading**: Content fetched if needed
7. **Persistence**: State saved to `sessionStorage`
8. **URL Update**: URL synchronized if window has path

### Closing a Window

1. **User Action**: Click close button
2. **Action Call**: `closeWindow('about')`
3. **State Saved**: Window state saved to `closedWindows`
4. **Store Update**: Window removed from `windowStates`
5. **Component Re-render**: Window disappears
6. **Persistence**: State saved to `sessionStorage`
7. **URL Update**: URL reset if it was the active window

## Key Files

- `src/store/window/slice.ts` - Window state management
- `src/store/icon/slice.ts` - Icon state management
- `src/store/index.ts` - Combined store root
- `src/types/window.ts` - Window type definitions (`WindowPosition`, `WindowSize`, `WindowState`, etc.)
- `src/types/icon.ts` - Icon type definitions
- `src/hooks/use-window-persistence.ts` - Window persistence
- `src/hooks/use-icon-persistence.ts` - Icon persistence
- `src/hooks/use-url-sync.ts` - URL synchronization

## Best Practices

1. **Use Selectors**: Always use individual selectors, not entire store
2. **Immutable Updates**: Never mutate state directly
3. **Stable Actions**: Actions are stable, safe for dependencies
4. **Batch Updates**: Group related updates in single `set` call
5. **Persistence**: Let hooks handle persistence, don't manually save
6. **Type Safety**: Use TypeScript types for all state
