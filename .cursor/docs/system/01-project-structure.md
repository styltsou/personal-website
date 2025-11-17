# Project Structure

This document provides an overview of the project's file and folder structure, explaining what each part contains and its purpose.

## Root Directory

```
/
├── .cursor/              # Cursor AI configuration and documentation
│   ├── docs/            # All project documentation
│   └── rules/           # Cursor rules for code generation
├── public/              # Static assets (images, SVGs)
├── src/                 # Source code
├── dist/                # Build output (generated)
├── node_modules/        # Dependencies (generated)
├── scripts/             # Utility scripts (e.g., track updates)
├── astro.config.mjs     # Astro configuration
├── package.json         # Dependencies and scripts
└── README.md           # Project overview

```

## Source Code Structure (`src/`)

### Components (`src/components/`)

**Core Desktop Components:**

- `desktop/` - Main desktop container component
- `window/` - Window component (draggable, resizable)
  - `title-bar/` - Window title bar with controls
    - `window-controls/` - Minimize, maximize, close buttons
  - `resize-handles/` - Window resize handles
  - `utils/` - Window-specific utilities
    - `window-utils.ts` - Window calculations and positioning
    - `viewport-constraints.ts` - Viewport constraint calculations
- `menu-bar/` - Top system menu bar
- `desktop-icons/` - Container for all desktop icons
  - `desktop-icon/` - Individual desktop icon component
  - `dragging-icon/` - Ghost icon shown while dragging
  - `utils.ts` - Icon grid utilities (single file, no folder)
- `loading-progress-bar/` - Loading indicator for content windows

**App Components (`src/components/apps/`):**

- `cv/` - CV/Resume viewer app
- `terminal/` - Terminal emulator
- `wikipedia/` - Wikipedia viewer
- `piano/` - Virtual piano app
- `flappy-bird/` - Flappy Bird game
- `music-player/` - Music player app with Spotify/YouTube integration

Each app directory typically contains:

- `index.tsx` - Main app component
- `icon.tsx` - Icon component for desktop
- `styles.module.scss` - Component-specific styles
- Additional files as needed (hooks, utils, etc.)

### Configuration (`src/`)

- `app-config.ts` - Central app configuration registry. Defines all available apps, their metadata, and whether they appear as desktop icons.
- `constants.ts` - Application-wide constants (MENU_BAR_HEIGHT, z-index values, etc.)

### Types (`src/types/`)

Centralized type definitions organized by domain:

- `app.ts` - App configuration types (`AppConfig`)
- `window.ts` - Window-related types (`WindowState`, `WindowPosition`, `WindowSize`, `ResizeConstraint`, `SnapSide`, `ClosedWindowState`)
  - **Note**: `WindowPosition` and `WindowSize` are the canonical types used throughout the codebase. All window-related utilities and hooks use these types from `@/types/window` (no duplicate `Position`/`Size` types exist).
- `icon.ts` - Icon-related types (`IconState`, `IconPosition`, `IconConfig`, `GridPosition`, `PixelPosition`, `GridDimensions`)

### Store (`src/store/`)

State management using Zustand:

- `window/` - Window state management
  - `slice.ts` - Window state slice (open/closed, position, size, z-index, etc.)
  - `types.ts` - Window store types
- `icon/` - Icon state management
  - `slice.ts` - Icon state slice (positions, selection, dragging state)
  - `types.ts` - Icon store types
- `index.ts` - Store root (combines all slices)

### Hooks (`src/hooks/`)

Custom React hooks for specific functionality:

- `use-window-drag.ts` - Window dragging logic
- `use-window-resize.ts` - Window resizing logic
- `use-window-content.ts` - Content loading for path-based windows
- `use-window-persistence.ts` - Window state persistence to sessionStorage
- `use-icon-drag.ts` - Icon dragging logic
- `use-icon-persistence.ts` - Icon position persistence
- `use-url-sync.ts` - URL synchronization with window state

### Utils (`src/utils/`)

General-purpose utility functions:

- `cn.ts` - Class name utility (similar to clsx)
- `date-time.ts` - Date/time formatting utilities
- `content-extractor.ts` - Content extraction utilities for window content
- `get-content-data.ts` - Content data utilities for build-time content embedding

**Note**: Feature-specific utilities are colocated with their components:

- Window utilities: `src/components/window/utils/`
- Icon utilities: `src/components/desktop-icons/utils.ts`

### Styles (`src/styles/`)

Global styles:

- `index.scss` - Main stylesheet entry point
- `_variables.scss` - CSS variables for theming (light/dark)
- `_base.scss` - Base styles, resets, global component styles
- `_mixins.scss` - SCSS mixins (3D effects, etc.)

### Layouts (`src/layouts/`)

Astro layout components:

- `BaseLayout.astro` - Base HTML layout with meta tags, theme initialization script
- `Layout.astro` - Page layout wrapper

### Pages (`src/pages/`)

Astro pages (content-based windows):

- `index.astro` - Home page (renders Desktop component)
- `about.astro` - About page content
- `projects.astro` - Projects page content
- `contact.astro` - Contact page content
- `api/` - API routes (if any)

### Content (`src/content/`)

Content configuration:

- `config.ts` - Content collection configuration
- `tracks/` - Music track data (JSON files)

## Key Files

### `src/app-config.ts`

Central registry of all apps. Defines:

- App IDs, titles, paths
- Custom React components
- Desktop icon configuration
- Resize constraints
- Pinned status (for menu bar)

**Note**: Type definitions are in `src/types/app.ts` and `src/types/window.ts`, not in this file.

### `src/constants.ts`

Application-wide constants:

- Layout constants (MENU_BAR_HEIGHT)
- Z-index constants (BASE_Z_INDEX, MAX_WINDOW_Z_INDEX, etc.)
- Other shared constants used across multiple modules

### `src/components/desktop/index.tsx`

Main React island component. Orchestrates:

- Window rendering
- State management integration
- Persistence hooks
- URL synchronization
- Content loading

### `src/store/window/slice.ts`

Zustand store slice managing all window state:

- Open/closed windows
- Positions and sizes
- Z-index management
- Maximized/minimized state
- Window snapping
- Persistence integration

### `src/store/icon/slice.ts`

Zustand store slice managing icon state:

- Icon positions (grid coordinates)
- Selection state
- Dragging state
- Persistence integration

## Build Output

- `dist/` - Generated build output (Astro static site)
- Contains compiled JavaScript, CSS, and static assets

## Documentation

- `.cursor/docs/` - All project documentation
  - `system/` - System architecture documentation (this directory)
  - `progress/` - Component-specific progress tracking
  - `technical/` - Technical deep-dives and fixes
  - `setup/` - Setup and integration guides

## Design Principles

1. **Component-based**: Each feature is a self-contained component
2. **Hierarchical organization**: Component structure reflects component relationships (e.g., window/title-bar/window-controls)
3. **Colocation**: Feature-specific utilities are colocated with their components
4. **State management**: Zustand stores for global state
5. **Custom hooks**: Reusable logic extracted into hooks
6. **Utility functions**: Pure functions for calculations
7. **Type safety**: TypeScript throughout
8. **Separation of concerns**: Clear boundaries between UI, state, and logic
9. **Path aliases**: Deep relative imports (`../../`) are avoided in favor of path aliases (`@/`)
