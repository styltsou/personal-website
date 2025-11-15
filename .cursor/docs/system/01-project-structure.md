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
- `menu-bar/` - Top system menu bar
- `desktop-icons/` - Container for all desktop icons
- `desktop-icon/` - Individual desktop icon component
- `dragging-icon/` - Ghost icon shown while dragging
- `resize-handles/` - Window resize handles
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

### Data (`src/data/`)

- `apps.ts` - Central app configuration registry. Defines all available apps, their metadata, and whether they appear as desktop icons.

### Types (`src/types/`)

Centralized type definitions organized by domain:

- `app.ts` - App configuration types (`AppConfig`)
- `window.ts` - Window-related types (`WindowState`, `WindowPosition`, `WindowSize`, `ResizeConstraint`, `SnapSide`, `ClosedWindowState`)
- `icon.ts` - Icon-related types (`IconState`, `IconPosition`, `IconConfig`, `GridPosition`, `PixelPosition`, `GridDimensions`)

### Stores (`src/stores/`)

State management using Zustand:

- `window-store.ts` - Window state management (open/closed, position, size, z-index, etc.)
- `icon-store.ts` - Icon state management (positions, selection, dragging state)

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

Utility functions:

- `window-utils.ts` - Window calculations (centering, cascading, z-index, constraints)
- `icon-grid.ts` - Grid system for icon positioning (snap-to-grid, collision detection)
- `cn.ts` - Class name utility (similar to clsx)
- `date-time.ts` - Date/time formatting utilities
- `viewport-constraints.ts` - Viewport constraint calculations

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

### `src/data/apps.ts`
Central registry of all apps. Defines:
- App IDs, titles, paths
- Custom React components
- Desktop icon configuration
- Resize constraints
- Pinned status (for menu bar)

**Note**: Type definitions are in `src/types/app.ts` and `src/types/window.ts`, not in this file.

### `src/components/desktop/index.tsx`
Main React island component. Orchestrates:
- Window rendering
- State management integration
- Persistence hooks
- URL synchronization
- Content loading

### `src/stores/window-store.ts`
Zustand store managing all window state:
- Open/closed windows
- Positions and sizes
- Z-index management
- Maximized/minimized state
- Window snapping
- Persistence integration

### `src/stores/icon-store.ts`
Zustand store managing icon state:
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
2. **State management**: Zustand stores for global state
3. **Custom hooks**: Reusable logic extracted into hooks
4. **Utility functions**: Pure functions for calculations
5. **Type safety**: TypeScript throughout
6. **Separation of concerns**: Clear boundaries between UI, state, and logic

