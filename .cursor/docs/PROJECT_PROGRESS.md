# Project Progress Tracker

> **Project**: Personal Website with Retro 90s OS Window Manager  
> **Tech Stack**: Astro, React, TypeScript, Zustand, CSS Modules + Sass  
> **Status**: Active Development

---

## 🎯 Project Overview

A personal portfolio website designed with a nostalgic 90s operating system aesthetic, featuring an interactive window manager where visitors can navigate between different sections (About, Projects, Contact) as draggable, resizable windows. The implementation emphasizes maintainability, accessibility, and user experience.

---

## ✅ Completed Features

### Setup Phase

- ✅ Installed all required dependencies (sass, astro-compress, ESLint, Prettier)
- ✅ Configured Astro with Compress integration and View Transitions API
- ✅ Set up ESLint and Prettier configuration for Astro, React, and TypeScript
- ✅ Created SCSS structure with CSS Modules (\_variables.scss, \_mixins.scss, \_base.scss, index.scss)
- ✅ Created BaseLayout.astro with SEO meta tags, SCSS import, and View Transitions
- ✅ Created app-config.ts file with app configurations (single source of truth)
  - Unified configuration for all apps (content-based and custom components)
  - Optional `path` field for content-based apps (omitted for custom component apps)
  - Icons co-located with their respective app components
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

- ✅ **Desktop Icons System**: Complete icon drag-and-drop implementation
  - See `DESKTOP_ICONS_PROGRESS.md` for detailed documentation
  - Drag-and-drop with snap-to-grid positioning
  - **Simplified click vs drag**: 5px movement threshold distinguishes clicks from drags
  - Collision detection and drop prevention
  - Z-index management and stacking context handling
  - Cursor management (grabbing/not-allowed)
  - Icon persistence in localStorage
  - **Mutual exclusivity**: Icon selection and window focus are mutually exclusive
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
- ✅ **Generic Window Component**:
  - Window component is generic and reusable
  - No default padding (each window handles its own padding)
  - Generic `hideOverflow` prop for windows that manage their own scrolling
  - Wikipedia window uses `hideOverflow` to prevent window-level scrollbars

#### Menu Bar Component (`menu-bar/index.tsx`)

- ✅ **Window Quick Access**:
  - Buttons for each window type
  - Opens windows on click
  - Visual state indicators (open, minimized, active)
  - Animated close icons with Framer Motion
  - Smooth transitions and hover states
- ✅ **Window Pinning**:
  - Static pinning configuration via `pinned` attribute in app config
  - Pinned apps always visible in menu bar
  - Unpinned apps only shown when open
  - Custom component apps configured as unpinned (only appear when open)
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
  - **Fast presence animations**: Window button presence animations set to 0.05s for snappier feel
- ✅ **Code Organization**:
  - Separated helper functions for state calculation, class generation, and event handling
  - Cleaner, more maintainable code structure
  - Reduced duplication through consolidated state management

#### Wikipedia Window Component (`wikipedia-window/index.tsx`)

- ✅ **Iframe Integration**:
  - Wikipedia embedded via iframe
  - Full-screen iframe with proper sizing
  - No window-level scrollbars (iframe handles its own scrolling)
  - Overflow properly managed to prevent content clipping
- ✅ **Theme Support**:
  - CSS filters applied to match site theme
  - Light theme: Wikipedia appears light (no filter)
  - Dark theme: Wikipedia inverted to dark mode
  - Smooth transitions between themes
  - Works across all Wikipedia pages (including navigation within iframe)
- ✅ **Scrollbar Management**:
  - Window content overflow hidden for Wikipedia window
  - Iframe scrollbar visible and functional
  - No content clipping or double scrollbars

#### Terminal App Component (`apps/terminal/index.tsx`)

- ✅ **Functional Terminal**:
  - Real input field with keyboard support
  - Command execution structure with extensible switch statement
  - Command history with up/down arrow navigation
  - Auto-scroll to bottom when new output is added
  - Auto-focus on input when terminal opens
- ✅ **Theme Support**:
  - Light theme: White background with black text
  - Dark theme: Black background with light gray text
  - Color-coded output (blue for output, red for errors)
  - Green prompt symbol and cursor
- ✅ **Built-in Commands**:
  - `help` - Shows available commands
  - `clear` - Clears terminal output
  - `echo <text>` - Echoes text back
  - Error handling for unknown commands
- ✅ **UI Features**:
  - Larger text size (1.125rem) for better readability
  - Green caret cursor matching terminal aesthetic
  - Monospace font for authentic terminal look
  - Scrollable output area
  - Proper line wrapping and whitespace preservation

### State Management Architecture

#### Zustand Store (`store/window/slice.ts`)

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

#### Window Utilities (`components/window/utils/window-utils.ts`)

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
- ✅ **Viewport Constraints** (`components/window/utils/viewport-constraints.ts`):
  - `constrainPositionToViewport()`: Keeps windows within viewport bounds (uses `WindowPosition` and `WindowSize` types)
  - `constrainSizeToViewport()`: Enforces minimum and maximum window sizes
  - Menu bar height consideration (prevents windows above menu bar)
  - **Note**: Uses canonical `WindowPosition` and `WindowSize` types from `@/types/window`
- ✅ **Z-index Management**:
  - Simplified z-index system with smaller values (1-100)
  - Base z-index of 10 for windows, incrementing by 1 per focus
  - Windows capped at 98 (leaves room for dragging icons at 99 and menu bar at 100)
  - Menu bar at 100 (always on top)
  - Icons at 1 (desktop surface, below windows)
  - Dragging icons at 99 (above all windows, below menu bar)

### Custom Hooks

#### Icon Hooks

- ✅ **use-icon-drag.ts**: Icon drag functionality with snap-to-grid, collision detection, drop prevention, and cursor management
  - **Simplified click vs drag**: Uses 5px movement threshold to distinguish clicks from drags
  - Proper event listener management with state-triggered effects
  - Click events work normally until drag threshold is crossed
- ✅ **use-icon-persistence.ts**: Icon position persistence in localStorage

#### Window Hooks

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
  - URL path matching to app configs
  - Prevents auto-opening windows when closing the last one

### Code Quality & Architecture

#### App Configuration System

- ✅ **Unified App Configuration** (`app-config.ts`):
  - Single source of truth for all app configurations
  - `AppConfig` interface with optional `path` field
  - Content-based apps: specify `path` (e.g., '/about', '/projects')
  - Custom component apps: omit `path`, specify `component`
  - Icons co-located with their app components (each app exports its icon)
  - Clean imports: both component and icon imported from same path
- ✅ **App Organization**:
  - All virtual apps in `components/apps/` folder
  - Each app in its own folder with `index.tsx` and `icon.tsx`
  - Icons exported from app's `index.tsx` for cleaner imports
  - Better maintainability: app code and icon together
- ✅ **Icon Management**:
  - Icon generation logic moved to `DesktopIcons` component
  - Icons generated from apps config (only apps with `desktopIcon` configured)
  - `IconConfig` interface and `getDesktopIcons()` function exported from DesktopIcons
  - No separate icon registry needed

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
- **Styling**: CSS Modules with Sass/SCSS
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
- [ ] Desktop icon customization (✅ Core implementation complete - see `DESKTOP_ICONS_PROGRESS.md`)
- [ ] **Dynamic window pinning**: Add context menu to menu bar buttons or desktop icons to pin/unpin windows dynamically (currently pinning is static via config)
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
│   ├── apps/         # Virtual app components (each app in its own folder)
│   │   ├── terminal/
│   │   │   ├── index.tsx    # App component
│   │   │   ├── icon.tsx      # App icon (exported from index.tsx)
│   │   │   └── styles.module.scss
│   │   ├── piano/
│   │   ├── flappy-bird/
│   │   ├── wikipedia/
│   │   └── cv/
│   ├── desktop/
│   ├── desktop-icons/  # Icon container (generates icons from apps config)
│   ├── desktop-icon/
│   ├── dragging-icon/
│   ├── window/
│   ├── title-bar/
│   ├── window-controls/
│   ├── resize-handles/
│   ├── menu-bar/
│   └── music-player/
├── store/            # Zustand store (organized by domain)
│   ├── window/
│   │   ├── slice.ts
│   │   └── types.ts
│   └── icon/
│       ├── slice.ts
│       └── types.ts
├── hooks/            # Custom React hooks (kebab-case naming)
│   ├── use-window-drag.ts
│   ├── use-window-resize.ts
│   ├── use-window-persistence.ts
│   ├── use-window-content.ts
│   ├── use-url-sync.ts
│   ├── use-icon-drag.ts
│   └── use-icon-persistence.ts
├── utils/            # General-purpose utilities
│   ├── cn.ts
│   ├── date-time.ts
│   ├── content-extractor.ts
│   └── get-content-data.ts
├── app-config.ts     # Single source of truth for app configuration
├── constants.ts      # Application-wide constants
│                      # - AppConfig interface
│                      # - All apps (content-based and custom components)
│                      # - Optional path field (only for content-based apps)
│                      # - Icons imported from their respective app folders
├── styles/           # SCSS files (CSS Modules)
│   ├── index.scss
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── _base.scss
└── pages/            # Astro pages (static content)
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
- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [Sass Documentation](https://sass-lang.com/documentation)

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
  - Utils: `cn.ts`, `date-time.ts` (general-purpose)
  - Window utils: `components/window/utils/window-utils.ts`, `components/window/utils/viewport-constraints.ts`
  - Icon utils: `components/desktop-icons/utils.ts`
  - Types: All types in `types/` directory (`WindowPosition`, `WindowSize`, etc.)
  - Store: `store/window/slice.ts`, `store/icon/slice.ts`
  - Follows modern React conventions and improves cross-platform compatibility
- ✅ **Import Updates**: All import statements updated to reflect new kebab-case file names
- ✅ **Cursor Rule Added**: Created `.cursor/rules/11-naming-conventions.mdc` to enforce kebab-case naming going forward

---

### Wikipedia & Terminal Windows (2024)

#### Wikipedia Window Implementation

- ✅ **Iframe Integration**: Wikipedia embedded via iframe with proper overflow management
- ✅ **Theme Support**: CSS filters applied to match site theme (light/dark mode)
- ✅ **Scrollbar Management**: Window-level scrollbars hidden, iframe scrollbar functional
- ✅ **No Content Clipping**: Proper container sizing prevents content from being cropped

#### Terminal Window Implementation

- ✅ **Functional Terminal**: Real input field with command execution structure
- ✅ **Command System**: Extensible command execution with switch statement
  - Built-in commands: `help`, `clear`, `echo`
  - Error handling for unknown commands
- ✅ **Command History**: Up/down arrow navigation through command history
- ✅ **Theme Support**: Black background in dark theme, white in light theme
- ✅ **UI Features**: Larger text (1.125rem), green caret cursor, scrollable output
- ✅ **Auto-scroll**: Terminal automatically scrolls to bottom on new output
- ✅ **Auto-focus**: Input field automatically focuses when terminal opens

#### Window Component Improvements (2024)

- ✅ **Generic Window Component**: Removed content-specific logic, made fully reusable
- ✅ **No Default Padding**: Window component has no default padding (each window handles its own)
- ✅ **Generic `hideOverflow` Prop**: Allows any window to disable overflow scrolling
- ✅ **Wikipedia Integration**: Uses `hideOverflow` prop to prevent window-level scrollbars

---

**Last Updated**: 2024 (Recent updates: Wikipedia window with theme support, functional terminal with command system, generic window component improvements)  
**Maintained By**: Personal project  
**Status**: Active development
