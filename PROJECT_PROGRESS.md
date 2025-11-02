# Project Progress Tracker

> **Project**: Personal Website with Retro 90s OS Window Manager  
> **Tech Stack**: Astro, React, TypeScript, Zustand, Tailwind CSS  
> **Status**: Active Development

---

## 🎯 Project Overview

A personal portfolio website designed with a nostalgic 90s operating system aesthetic, featuring an interactive window manager where visitors can navigate between different sections (About, Projects, Contact) as draggable, resizable windows. The implementation emphasizes maintainability, accessibility, and user experience.

---

## ✅ Completed Features

### Setup Phase

- ✅ Installed all required dependencies (@astrojs/tailwind, astro-compress, ESLint, Prettier)
- ✅ Configured Astro with Tailwind, Compress integrations and View Transitions API
- ✅ Set up ESLint and Prettier configuration for Astro, React, TypeScript, and Tailwind
- ✅ Created retro.css with 90s OS aesthetic styling (window borders, buttons, CSS variables)
- ✅ Created BaseLayout.astro with SEO meta tags, Tailwind import, retro.css, and View Transitions
- ✅ Created windows.ts data file with window configurations (about, projects, contact)
- ✅ Created static pages: about.astro, projects.astro, contact.astro with SEO-friendly content

### Core Window Manager Implementation

#### Window Component (`window.tsx`)
- ✅ **Native Drag Functionality**: Custom drag implementation using React mouse events (no external drag library dependency)
  - Smooth dragging with position constraints to keep windows within viewport
  - Drag prevention when clicking on window control buttons
  - Automatic window focus on drag start
  - Windows constrained to never go above menu bar (32px minimum Y position)
- ✅ **Window Controls**: 
  - Minimize button (hides window)
  - Maximize/Restore button (fullscreen with menu bar consideration)
  - Close button
- ✅ **Window Resizing**: 
  - Eight-directional resize handles (corners and edges)
  - Minimum window size enforcement
  - Position updates when resizing from left/top edges
  - Smooth resize interaction with proper cursor feedback
- ✅ **Window Snapping**: 
  - Snap to left/right edges by dragging window near viewport edges (16px threshold)
  - Snap preview overlay during dragging
  - Windows snap to half viewport width when dragged to edges
  - Smooth visual transition during snap/unsnap
  - Visual snapped state while maintaining actual size/position in store (no state mutation)
- ✅ **Unsnap Behavior**: 
  - Automatic unsnap when dragging away from snap side
  - Size never changes during snap/unsnap (visual only)
  - Cursor position preserved in title bar during unsnap (ratio-based positioning)
  - Works seamlessly during drag (mouse move) and on mouse up
  - Smart position calculation to keep cursor within title bar bounds
- ✅ **Maximized Window Handling**: 
  - Windows maximize below menu bar (32px offset)
  - Position and size never change (only display is overridden)
  - Restoring just toggles display override - no state restoration needed
- ✅ **Keyboard Accessibility**: 
  - Full keyboard navigation support (Tab, Enter, Escape)
  - Keyboard shortcuts for window operations
  - Visible focus indicators
- ✅ **ARIA Labels and Semantic HTML**: 
  - Proper ARIA attributes for screen readers
  - Dialog role and modal semantics
- ✅ **Position Persistence**: 
  - Window positions saved on drag end
  - State always reflects actual position/size (never overridden)

#### Desktop Component (`desktop.tsx`)
- ✅ **Window Stack Management**: 
  - Z-index ordering with automatic focus-to-front behavior
  - Active window tracking
  - Instant focus transitions (no animation delay)
- ✅ **State Management**: 
  - Zustand store for centralized window state
  - Clean action-based API for window operations
- ✅ **URL Synchronization**: 
  - Browser history integration with `history.pushState()`
  - Back/forward button support
  - URL updates on active window changes
  - Prevents unintended window reopening when closing last window
- ✅ **Session Persistence**: 
  - Window states saved to sessionStorage
  - Positions, sizes, and window states persist across page refreshes
- ✅ **Dynamic Content Loading**: 
  - Content fetched from static HTML pages
  - Loading states and error handling
  - Content caching to reduce redundant requests
- ✅ **Window Filtering**: 
  - Minimized windows excluded from rendering
  - Efficient rendering with proper React keys

#### Menu Bar Component (`menu-bar/index.tsx`)
- ✅ **Window Quick Access**: 
  - Buttons for each window type
  - Opens windows on click
  - Visual state indicators (open, minimized, active)
  - Animated close icons with Framer Motion
  - Smooth transitions and hover states
- ✅ **Theme Toggle**: 
  - Dark/light theme switching
  - Persistent theme preference (localStorage)
  - System preference detection
- ✅ **Clock and Date**: 
  - Live updating time and date display
  - Formatted for readability
- ✅ **Framer Motion Variants**: 
  - Clean variant-based animations for button states
  - Transition configurations defined within variants
  - Consistent 0.03s transition duration across all animations
- ✅ **Code Organization**: 
  - Separated helper functions for state calculation, class generation, and event handling
  - Cleaner, more maintainable code structure
  - Reduced duplication through consolidated state management

### State Management Architecture

#### Zustand Store (`window-store.ts`)
- ✅ **Centralized State**: 
  - Window states array with position, size, z-index, and flags
  - Active window ID tracking
  - Z-index counter management
  - Snap side tracking (`snapSide`: 'left' | 'right' | null) for display override only
  - Position/size always reflect actual values (never mutated for maximize/snap)
- ✅ **Window Operations**: 
  - `openWindow()`: Opens or focuses existing windows with cascading positioning
  - `closeWindow()`: Removes window from stack
  - `minimizeWindow()`: Hides window while preserving state
  - `maximizeWindow()`: Sets maximized flag (display override, position/size unchanged)
  - `focusWindow()`: Brings window to front with z-index update
  - `updateWindowPosition()`: Updates window position on drag
  - `updateWindowSize()`: Updates window size on resize
  - `updateWindowContent()`: Sets window content after loading
  - `snapWindow()`: Snaps window to left or right edge
  - `unsnapWindow()`: Restores window from snapped state
  - `closeAllWindows()`: Clears all windows
- ✅ **Window Snapping State Management**: 
  - Snapping sets `snapSide` flag only (no position/size mutation)
  - Visual snapping (derived during rendering) without modifying actual position/size
  - Component overrides display when `snapSide` is set
- ✅ **Window Maximization State Management**: 
  - Maximization sets `isMaximized` flag only (no position/size mutation)
  - Component overrides display when `isMaximized` is true
  - Restoring just clears the flag - no state restoration needed
- ✅ **Smart Window Opening**: 
  - Existing window detection (brings to front instead of duplicating)
  - Cascading position calculation
  - Automatic restoration of minimized windows

### Positioning and Layout Features

#### Window Utilities (`window-utils.ts`)
- ✅ **Centered Positioning**: 
  - Calculates centered position accounting for viewport size
  - 15% vertical offset for better visual balance
  - Respects menu bar height (32px minimum Y position)
- ✅ **Cascading Windows**: 
  - **Feature**: When opening a new window, if another window is at the default centered position, the new window opens offset by 40px right and 40px down
  - Creates classic window stacking effect
  - Prevents windows from completely covering each other
  - Only cascades when default position is occupied
- ✅ **Window Snapping Detection**: 
  - `detectSnapSide()`: Detects snap based on window position (16px threshold from edges)
  - `detectSnapSideFromMouse()`: Detects snap based on mouse cursor position
  - `getSnappedPreview()`: Calculates snapped window position and size (half viewport width)
  - Snap preview for visual feedback during dragging
- ✅ **Maximized Window Calculations**: 
  - Accounts for menu bar height (32px)
  - Calculates proper maximized size and position
- ✅ **Viewport Constraints**: 
  - `constrainPositionToViewport()`: Keeps windows within viewport bounds
  - `constrainWindowSize()`: Enforces minimum and maximum window sizes
  - Menu bar height consideration (prevents windows above menu bar)
- ✅ **Z-index Management**: 
  - Automatic z-index calculation
  - Base z-index of 1000 with 1000 increments
  - Max z-index tracking for proper stacking

### Custom Hooks

#### `use-window-drag.ts`
- ✅ **Window Dragging**: 
  - Smooth drag implementation with mouse event handling
  - Position constraints to keep windows within viewport
  - Automatic focus on drag start
  - Window snapping detection during dragging
  - Snap preview display
- ✅ **Snap Detection & Triggering**: 
  - Detects snap zones (16px from viewport edges)
  - Triggers snap when dragging window to edges
  - Visual preview overlay during drag
- ✅ **Unsnap Logic**: 
  - Automatic unsnap when dragging away from snap side
  - Size never changes (visual override removed)
  - Ratio-based cursor position preservation in title bar
  - Handles unsnap during mouse move and mouse up events

#### `use-window-resize.ts`
- ✅ **Window Resizing**: 
  - Eight-directional resize handles support
  - Minimum size enforcement
  - Position updates for left/top edge resizing
  - Smooth resize with cursor feedback
  - Position synchronization with drag hook

#### `use-window-persistence.ts`
- ✅ **Session Persistence**: 
  - Loads window states from sessionStorage on mount
  - Saves window states on every change (including snap states)
  - Handles JSON serialization/deserialization
- ✅ **Initialization Control**: 
  - Prevents multiple initialization from persistence
  - One-time load on component mount

#### `use-window-content.ts`
- ✅ **Content Loading**: 
  - Fetches content from static HTML pages
  - Loading state tracking per window
  - Content caching to prevent redundant fetches
  - Error handling for failed loads

#### `use-url-sync.ts`
- ✅ **URL Synchronization**: 
  - Initial mount detection to prevent unintended window opening
  - Browser back/forward navigation support
  - URL path matching to window configs
  - Prevents auto-opening windows when closing the last one

### Code Quality & Architecture

#### Refactoring Improvements
- ✅ **Initial Refactoring**: 
  - Extracted window management logic into custom hooks
  - Separated concerns: persistence, URL sync, content loading
  - Improved component readability
- ✅ **Zustand Migration**: 
  - Migrated from React useState to Zustand store
  - Centralized state management
  - Improved developer experience with clean action API
  - Better performance with selector-based subscriptions
- ✅ **Type Safety**: 
  - Full TypeScript coverage
  - Strict mode enabled
  - Proper interface definitions for all data structures

### UI/UX Enhancements

- ✅ **Instant Focus Transitions**: 
  - Removed box-shadow transition for immediate visual feedback
  - Window focus changes are instant (no animation delay)
- ✅ **Visual Polish**: 
  - Active window has prominent shadow
  - Cursor changes on drag (grab/grabbing)
  - Proper button hover states
  - Retro aesthetic maintained throughout

### Bug Fixes

- ✅ **Buttons Not Working**: 
  - Fixed Zustand action selector usage
  - Ensured stable action references
- ✅ **Window Jumping on Close**: 
  - Fixed URL sync logic to prevent unintended window reopening
  - Added initial mount detection
- ✅ **Position Loss on Minimize/Maximize**: 
  - Fixed by keeping position/size unchanged during maximize
  - Display override approach eliminates restore complexity
- ✅ **Windows Not Coming to Front**: 
  - Fixed z-index updates on focus
  - Direct DOM manipulation for z-index to bypass potential Framer Motion issues
  - Focus triggered on window click and drag start
- ✅ **Drag Not Working**: 
  - Fixed drag calculation logic
  - Proper event handling for mouse events
  - Button clicks don't interfere with dragging
- ✅ **Initial Positioning**: 
  - Fixed windows appearing at (0,0)
  - Proper position initialization from store
  - CSS fixed positioning correct
- ✅ **Maximized Window Overlapping Menu Bar**: 
  - Added menu bar height consideration
  - Maximized windows positioned below menu bar
  - Window height adjusted for maximized state
- ✅ **Windows Going Above Menu Bar**: 
  - Viewport constraints updated to prevent windows from going above menu bar
  - Minimum Y position set to menu bar height (32px)
  - Centered positioning respects menu bar
- ✅ **Window Snapping Implementation**: 
  - Snap detection based on window position and mouse cursor
  - Visual snap preview during dragging
  - Visual-only snapping (no state mutation)
  - Smooth snap/unsnap transitions
- ✅ **Unsnap Cursor Position Issue**: 
  - Fixed cursor ending up outside title bar when unsnapping
  - Implemented ratio-based positioning to preserve cursor relative position
  - Works correctly when unsnapping from opposite side of snap direction
- ✅ **Maximize/Restore Simplification**: 
  - Refactored to display-override approach instead of state mutation
  - Position/size never change during maximize (only display is overridden)
  - Eliminated need for originalSize/originalPosition tracking
  - Restore now just toggles flag - much simpler and more maintainable

---

## 🏗️ Architecture Decisions

### Why Zustand?
- **Simplicity**: Minimal boilerplate compared to Redux
- **Performance**: Selector-based subscriptions prevent unnecessary re-renders
- **Developer Experience**: Clean, readable action API
- **Bundle Size**: Smaller than Redux, perfect for this use case

### Why Native Drag Instead of Framer Motion?
- **Control**: Direct control over drag behavior and z-index
- **Performance**: No animation library overhead for drag interactions
- **Reliability**: Avoids potential conflicts with z-index management
- **Customization**: Easier to implement custom constraints and behaviors

### Design Patterns Used
- **Custom Hooks**: Separation of concerns, reusability
- **State Management Store**: Centralized state with actions
- **Utility Functions**: Pure functions for calculations
- **Component Composition**: Small, focused components
- **Progressive Enhancement**: Works without JavaScript (static pages)
- **Display-Override Pattern**: State = actual data, Display = visual override (used for maximize/snap)

---

## 📊 Technical Specifications

### Technologies
- **Framework**: Astro (static site generation)
- **UI Framework**: React (for interactive components)
- **State Management**: Zustand
- **Styling**: Tailwind CSS + Custom CSS
- **Type Safety**: TypeScript (strict mode)
- **Build Tool**: Vite (via Astro)

### Key Metrics
- **Window Z-index Base**: 1000 (increments of 1000)
- **Menu Bar Height**: 32px
- **Cascade Offset**: 40px (horizontal and vertical)
- **Default Window Size**: 900x700px
- **Minimum Window Size**: 400x300px
- **Position Tolerance**: 5px (for position comparison)
- **Snap Threshold**: 16px (distance from edge to trigger snap)
- **Snapped Window Width**: 50% of viewport (half-screen layout)

### Performance Considerations
- SessionStorage for persistence (faster than localStorage)
- Content caching to reduce fetch requests
- Selector-based Zustand subscriptions
- Efficient React rendering with proper keys
- Static page generation for SEO

---

## 🧭 Future Enhancements

### Potential Features
- [ ] Window content caching improvements
- [ ] Better error states for failed content loads
- [ ] Window animations for minimize/restore
- [ ] Desktop icon customization
- [ ] Top/bottom edge snapping (in addition to left/right)
- [ ] Corner snapping (quarter-screen layouts)
- [ ] Multiple desktop spaces/workspaces
- [ ] Window history/undo functionality
- [ ] Custom window themes
- [ ] Window grouping/tabs

### Technical Improvements
- [ ] Unit tests for window manager logic
- [ ] E2E tests for user interactions
- [ ] Performance monitoring
- [ ] Accessibility audit and improvements
- [ ] Internationalization (i18n) support
- [ ] Progressive Web App (PWA) features

---

## 🐞 Known Issues

### Minor Issues
- Window position updates on drag end may need optimization
- Content loading error handling could be more robust
- SessionStorage persistence is session-only (by design, but could offer localStorage option)

### Design Considerations
- Currently using sessionStorage for persistence (intentional for privacy)
- Could add option for localStorage persistence for long-term window layouts
- Maximized window calculations may need adjustment for different screen sizes

---

## 📝 Development Notes

### Key Learnings
- Zustand's selector pattern prevents unnecessary re-renders
- Direct DOM manipulation sometimes necessary for critical styles (z-index)
- SessionStorage is perfect for temporary state persistence
- Custom drag implementation gives more control than libraries
- Cascading windows create a nice UX without being intrusive

### Best Practices Applied
- TypeScript strict mode for type safety
- Semantic HTML for accessibility
- ARIA labels for screen readers
- Progressive enhancement approach
- SEO-friendly static pages
- Code splitting and lazy loading where applicable

### Code Organization
```
src/
├── components/        # React components (kebab-case naming)
│   ├── desktop.tsx
│   ├── window.tsx
│   ├── title-bar.tsx
│   ├── window-controls.tsx
│   ├── resize-handles.tsx
│   └── menu-bar/      # Menu bar component and subcomponents
│       ├── index.tsx
│       └── theme-toggle.tsx
├── stores/           # Zustand stores (kebab-case naming)
│   └── window-store.ts
├── hooks/            # Custom React hooks (kebab-case naming)
│   ├── use-window-drag.ts
│   ├── use-window-resize.ts
│   ├── use-window-persistence.ts
│   ├── use-window-content.ts
│   └── use-url-sync.ts
├── utils/            # Pure utility functions (kebab-case naming)
│   ├── window-utils.ts
│   ├── viewport-constraints.ts
│   └── date-time.ts
├── data/             # Static data (kebab-case naming)
│   └── windows.ts
├── styles/           # CSS files
│   └── retro.css
└── pages/             # Astro pages (static content)
```

---

## 🎨 Portfolio-Ready Features

### Standout Features for Case Study
1. **Custom Window Manager**: Full-featured window system built from scratch
2. **State Management**: Clean Zustand implementation with centralized state
3. **Cascading Windows**: Smart positioning algorithm for better UX
4. **Accessibility**: Full keyboard navigation and ARIA support
5. **Performance**: Optimized rendering and efficient state updates
6. **User Experience**: Intuitive interactions with instant feedback
7. **Code Quality**: Well-organized, maintainable, TypeScript-strict

### Technical Challenges Solved
- Z-index management in a dynamic window stack
- Position persistence across interactions
- URL synchronization without page reloads
- Cascading positioning algorithm
- Drag functionality with proper constraints
- Maximized window positioning below menu bar
- Display-override pattern for maximize/snap (state = data, display = view)
- Eliminated complex state sync logic through simpler architecture

---

## 📚 Resources & References

### Documentation
- [Astro Documentation](https://docs.astro.build)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Inspiration
- Classic 90s operating systems (Windows 95, Mac OS System 7)
- Modern window managers (e.g., tiling window managers)

---

---

## 🎯 Recent Updates (2024)

### Window Snapping & Resizing Features

#### Window Snapping
- ✅ Implemented left/right edge snapping with 16px threshold
- ✅ Visual snap preview overlay during dragging
- ✅ Half-viewport width snapped layout
- ✅ Visual-only snapping (size/position never change in state)
- ✅ Smooth snap/unsnap transitions

#### Unsnap Behavior
- ✅ Automatic unsnap when dragging away from snap side
- ✅ Visual override removed (size/position already correct in state)
- ✅ Ratio-based cursor position preservation (cursor stays in title bar)
- ✅ Works correctly when unsnapping from opposite side of snap direction
- ✅ Handles unsnap both during mouse move and mouse up events

#### Maximize/Restore Simplification
- ✅ Refactored to display-override approach (2024)
- ✅ Position/size never mutate during maximize - component overrides display
- ✅ Eliminated originalSize/originalPosition tracking (redundant state removed)
- ✅ Restore now just toggles isMaximized flag - no state restoration needed
- ✅ Much simpler, more maintainable, and eliminates sync issues

#### Window Resizing
- ✅ Eight-directional resize handles (corners and edges)
- ✅ Minimum window size enforcement (400x300px)
- ✅ Position updates when resizing from left/top edges
- ✅ Smooth resize interaction with proper cursor feedback

#### Viewport Constraints
- ✅ Windows prevented from going above menu bar (32px minimum Y)
- ✅ Viewport constraints updated to respect menu bar height
- ✅ Centered positioning respects menu bar

#### Bug Fixes & Simplifications
- ✅ Fixed cursor position issue during unsnap (ratio-based positioning)
- ✅ Fixed maximize/restore bug where window jumped to wrong position
- ✅ Refactored to display-override approach - eliminated state mutation complexity
- ✅ Removed redundant originalSize/originalPosition tracking
- ✅ Simplified ClosedWindowState (removed unused snapSide, originalSize/originalPosition)

### Code Quality & Naming Conventions (2024)

#### Menu Bar Refactoring
- ✅ **Component Cleanup**: Refactored menu bar component for better maintainability
  - Extracted state calculation logic into helper functions
  - Separated button class generation, style calculation, and event handling
  - Consolidated window state logic to eliminate duplication
  - Improved code readability and organization
- ✅ **Framer Motion Variants**: 
  - Migrated to variant-based animation system
  - Transitions defined directly within variants
  - Consistent 0.03s transition duration for button and close icon animations
  - Cleaner animation configuration with better maintainability

#### Naming Convention Migration
- ✅ **Kebab-Case Naming**: Migrated all files to kebab-case naming convention
  - Components: `desktop.tsx`, `window.tsx`, `title-bar.tsx`, `window-controls.tsx`, `resize-handles.tsx`
  - Hooks: `use-window-drag.ts`, `use-window-resize.ts`, `use-window-persistence.ts`, `use-window-content.ts`, `use-url-sync.ts`
  - Utils: `window-utils.ts`, `viewport-constraints.ts`, `date-time.ts`
  - Stores: `window-store.ts`
  - Follows modern React conventions and improves cross-platform compatibility
- ✅ **Import Updates**: All import statements updated to reflect new kebab-case file names
- ✅ **Cursor Rule Added**: Created `.cursor/rules/11-naming-conventions.mdc` to enforce kebab-case naming going forward

---

**Last Updated**: 2024 (Recent updates: Menu bar refactoring, kebab-case naming migration, Framer Motion variants)  
**Maintained By**: Personal project  
**Status**: Active development
