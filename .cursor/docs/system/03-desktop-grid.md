# Desktop Grid System

This document explains how the desktop icon grid system works, including grid calculation, icon positioning, collision detection, and drag-and-drop.

## Overview

The desktop uses a grid-based system for organizing icons. Icons snap to grid cells, preventing overlap and maintaining a clean, organized desktop layout.

## Grid System

### Grid Dimensions

The grid is calculated dynamically based on viewport size:

- **Cell size**: 100x100px (matches icon container size exactly)
- **Padding**: 20px from all edges
- **Menu bar offset**: Grid starts below the 32px menu bar

**Calculation:**
```
availableWidth = viewportWidth - (padding * 2)
availableHeight = viewportHeight - padding - menuBarHeight
columns = floor(availableWidth / 100)
rows = floor(availableHeight / 100)
startX = 20px
startY = 20px + 32px (menu bar)
```

### Grid Coordinates

Icons use grid coordinates (gridX, gridY) rather than pixel coordinates:
- `gridX`: Column index (0-based)
- `gridY`: Row index (0-based)

**Conversion:**
- Grid → Pixel: `pixelX = startX + (gridX * 100)`
- Pixel → Grid: `gridX = round((pixelX - startX) / 100)`

## Icon State Management

### Icon Store

The `store/icon/slice.ts` manages icon state:

**State:**
- `iconStates` - Array of icon positions (grid coordinates)
- `selectedIconId` - Currently selected icon
- `draggingIconId` - Icon being dragged
- `draggingIconPosition` - Pixel position of dragging icon
- `hasLoadedFromPersistence` - Whether state has been restored

**Actions:**
- `updateIconPosition(id, position)` - Update icon grid position
- `selectIcon(id)` - Select an icon
- `deselectIcons()` - Clear selection
- `setDraggingIcon(id, position)` - Set dragging state

### Icon Configuration

Icons are generated from `app-config.ts`:
- Only apps with `desktopIcon` property appear as icons
- Icon label defaults to app title if not specified
- Icon can be a React component or image path

## Icon Positioning

### Initial Placement

When icons are first created:
- Placed in a grid pattern starting from top-left
- Spread horizontally with spacing (at least 4 icons per row, or half of columns)
- Automatically constrained to valid grid bounds

### Position Updates

When an icon is moved:
1. Pixel position is converted to grid coordinates
2. Grid position is constrained to valid bounds
3. Collision detection finds nearest free cell if target is occupied
4. Position is updated in store
5. Persistence saves new position

## Collision Detection

### Occupied Cells

The system tracks occupied grid cells:
- Format: `Set<string>` where each string is `"gridX,gridY"`
- Updated when icons are moved
- Used to prevent overlapping icons

### Finding Free Cells

When placing an icon on an occupied cell:
1. Check if target cell is free (excluding current icon's position)
2. If occupied, search in expanding radius using Manhattan distance
3. Return nearest free cell
4. If no free cell found (shouldn't happen), return constrained target position

**Manhattan Distance**: `|dx| + |dy|` (not Euclidean)

## Drag and Drop

### Dragging Process

1. **Start**: User presses mouse on icon
   - Icon enters dragging state
   - Ghost icon appears at cursor position
   - Original icon becomes semi-transparent

2. **During Drag**:
   - Ghost icon follows cursor
   - Grid preview shows where icon will snap
   - Position updates in real-time

3. **End**: User releases mouse
   - Icon snaps to nearest grid cell
   - Collision detection finds free cell if needed
   - Position is updated in store
   - Dragging state is cleared

### Visual Feedback

- **Ghost icon**: Rendered at Desktop level (z-index 99) to appear above windows
- **Grid preview**: Shows target grid cell during drag
- **Opacity**: Dragging icon becomes semi-transparent (0.7)

## Icon Selection

### Selection State

- Only one icon can be selected at a time
- Selected icon has blue background and border
- Clicking outside deselects all icons
- Clicking another icon switches selection

### Selection Behavior

- **Single click**: Selects icon
- **Double click**: Opens associated window
- **Click outside**: Deselects all icons and unfocuses windows

## Z-Index Management

Icons have a fixed z-index:
- **Icons**: z-index 1 (desktop surface, below windows)
- **Dragging icon**: z-index 99 (above all windows, below menu bar)
- **Windows**: z-index 10-98
- **Menu bar**: z-index 100 (always on top)

## Persistence

Icon positions are persisted to `localStorage`:
- Saves grid coordinates (not pixel positions)
- Restores on page reload
- Format: `{ [iconId]: { gridX: number, gridY: number } }`

See `use-icon-persistence.ts` for implementation details.

## Grid Utilities

The `icon-grid.ts` file provides utility functions:

- `calculateGridDimensions()` - Calculate grid size based on viewport
- `snapToGrid(pixelX, pixelY)` - Convert pixel to grid coordinates
- `gridToPixel(gridX, gridY)` - Convert grid to pixel coordinates
- `constrainGridPosition(gridX, gridY)` - Ensure position is within bounds
- `getOccupiedCells(positions)` - Create set of occupied cells
- `isCellOccupied(gridX, gridY, occupiedCells)` - Check if cell is occupied
- `findNearestFreeCell(targetX, targetY, occupiedCells)` - Find free cell

## Key Files

- `src/store/icon/slice.ts` - Icon state management
- `src/components/desktop-icons/index.tsx` - Icon container component
- `src/components/desktop-icon/index.tsx` - Individual icon component
- `src/hooks/use-icon-drag.ts` - Icon dragging logic
- `src/components/desktop-icons/utils.ts` - Grid calculation utilities

