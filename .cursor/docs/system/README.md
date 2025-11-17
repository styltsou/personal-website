# System Documentation

This directory contains comprehensive documentation explaining how the system works. These documents serve multiple purposes:

1. **For Cursor AI**: Helps Cursor understand the architecture and avoid breaking changes
2. **For Developers**: Onboarding guide to understand the codebase
3. **For Maintenance**: Reference when making changes or debugging

## Documentation Structure

### [01-project-structure.md](./01-project-structure.md)

Overview of the project's file and folder structure. Explains what each directory and key file contains.

### [02-window-management.md](./02-window-management.md)

Complete guide to the window management system:

- Window lifecycle (open, close, minimize, maximize)
- Positioning and cascading
- Z-index management
- Dragging and resizing
- Window snapping
- Persistence

### [03-desktop-grid.md](./03-desktop-grid.md)

Desktop icon grid system:

- Grid calculation and dimensions
- Icon positioning and collision detection
- Drag and drop mechanics
- Selection and interaction
- Persistence

### [04-app-configuration.md](./04-app-configuration.md)

Unified app and file registration and configuration:

- Unified config with `type: 'app' | 'file'` field
- App types (content-based vs component-based)
- File configuration and desktop icons
- Desktop icon configuration
- Resize constraints
- Keeping windows mounted when minimized (`keepMountedWhenMinimized`)
- Adding new apps and files
- Integration with window system
- Props support for app components

### [05-content-loading.md](./05-content-loading.md)

Content loading system for path-based windows:

- Fetching and parsing HTML
- Content caching
- Loading states
- Integration with Astro pages
- Performance optimizations

### [06-state-management.md](./06-state-management.md)

State management architecture:

- Zustand stores (window and icon)
- State access patterns
- Persistence (sessionStorage and localStorage)
- URL synchronization
- Performance considerations

### [07-seo-performance.md](./07-seo-performance.md)

SEO and performance optimizations:

- Hybrid output mode and static generation
- React island hydration strategies
- Content embedding at build time
- Structured data (JSON-LD)
- Meta tags and sitemap
- Performance metrics and best practices

### [08-file-system.md](./08-file-system.md)

File system and file opening:

- File associations (extension to app mappings)
- `openFile` action and workflow (refactored to reuse `openWindow` logic)
- File configuration in unified config
- App component integration with `filePath` prop
- Desktop file icons
- File windows in menu bar
- Multiple file instances
- File window persistence
- Adding support for new file types

## How to Use This Documentation

### For Understanding the System

Start with [01-project-structure.md](./01-project-structure.md) to get an overview, then read the other documents based on what you need to understand.

### For Making Changes

Before modifying code:

1. Read the relevant system documentation
2. Understand the current architecture
3. Ensure your changes align with existing patterns
4. Update documentation if architecture changes

### For Debugging

When debugging issues:

1. Check the relevant system documentation
2. Understand the expected behavior
3. Trace through the documented flow
4. Identify where the issue might be

## Key Concepts

### Window System

- Windows are managed by Zustand store
- State persists to sessionStorage
- Windows can be dragged, resized, minimized, maximized, and snapped
- Z-index managed automatically

### Grid System

- Icons snap to 100x100px grid
- Collision detection prevents overlap
- Positions persist to localStorage
- Grid calculated dynamically from viewport

### App System

- All apps and files registered in unified `app-config.ts`
- Config uses `type: 'app' | 'file'` to distinguish entries
- Two app types: content-based (path) and component-based (component)
- Files open in associated apps via file associations
- Desktop icons generated from app and file config
- Window state includes full app config
- Apps can receive typed props via generic `TProps` parameter

### Content Loading

- Path-based apps fetch HTML from Astro pages
- Content extracted from `<main>` element
- Cached in memory after first load
- Loading states tracked and displayed

### State Management

- Zustand for global state
- Selective subscriptions for performance
- Persistence hooks handle storage
- URL synchronized with window state

## Architecture Principles

1. **Single Source of Truth**: App config in `app-config.ts`, state in store
2. **Separation of Concerns**: UI, state, and logic are separate
3. **Type Safety**: TypeScript throughout
4. **Performance**: Selective subscriptions, memoization, caching
5. **Persistence**: Automatic state persistence
6. **URL Sync**: Window state synchronized with browser URL

## Related Documentation

- `.cursor/docs/progress/` - Component-specific progress tracking
- `.cursor/docs/technical/` - Technical deep-dives and fixes
- `.cursor/docs/setup/` - Setup and integration guides
