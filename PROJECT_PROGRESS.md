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

#### Window Component (`Window.tsx`)
- ✅ **Native Drag Functionality**: Custom drag implementation using React mouse events (no external drag library dependency)
  - Smooth dragging with position constraints to keep windows within viewport
  - Drag prevention when clicking on window control buttons
  - Automatic window focus on drag start
- ✅ **Window Controls**: 
  - Minimize button (hides window)
  - Maximize/Restore button (fullscreen with menu bar consideration)
  - Close button
- ✅ **Maximized Window Handling**: 
  - Windows maximize below menu bar (32px offset)
  - Position and size preserved when restoring from maximized state
- ✅ **Keyboard Accessibility**: 
  - Full keyboard navigation support (Tab, Enter, Escape)
  - Keyboard shortcuts for window operations
  - Visible focus indicators
- ✅ **ARIA Labels and Semantic HTML**: 
  - Proper ARIA attributes for screen readers
  - Dialog role and modal semantics
- ✅ **Position Persistence**: 
  - Window positions saved on drag end
  - Original position preserved for restore operations

#### Desktop Component (`Desktop.tsx`)
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

#### Menu Bar Component (`MenuBar.tsx`)
- ✅ **Window Quick Access**: 
  - Buttons for each window type
  - Opens windows on click
- ✅ **Theme Toggle**: 
  - Dark/light theme switching
  - Persistent theme preference (localStorage)
  - System preference detection
- ✅ **Clock and Date**: 
  - Live updating time and date display
  - Formatted for readability

### State Management Architecture

#### Zustand Store (`windowStore.ts`)
- ✅ **Centralized State**: 
  - Window states array with position, size, z-index, and flags
  - Active window ID tracking
  - Z-index counter management
- ✅ **Window Operations**: 
  - `openWindow()`: Opens or focuses existing windows with cascading positioning
  - `closeWindow()`: Removes window from stack
  - `minimizeWindow()`: Hides window while preserving state
  - `maximizeWindow()`: Fullscreen with position/size preservation
  - `focusWindow()`: Brings window to front with z-index update
  - `updateWindowPosition()`: Updates window position on drag
  - `updateWindowContent()`: Sets window content after loading
  - `closeAllWindows()`: Clears all windows
- ✅ **Smart Window Opening**: 
  - Existing window detection (brings to front instead of duplicating)
  - Cascading position calculation
  - Automatic restoration of minimized windows

### Positioning and Layout Features

#### Window Utilities (`windowUtils.ts`)
- ✅ **Centered Positioning**: 
  - Calculates centered position accounting for viewport size
  - 15% vertical offset for better visual balance
- ✅ **Cascading Windows**: 
  - **Feature**: When opening a new window, if another window is at the default centered position, the new window opens offset by 40px right and 40px down
  - Creates classic window stacking effect
  - Prevents windows from completely covering each other
  - Only cascades when default position is occupied
- ✅ **Maximized Window Calculations**: 
  - Accounts for menu bar height (32px)
  - Calculates proper maximized size and position
- ✅ **Z-index Management**: 
  - Automatic z-index calculation
  - Base z-index of 1000 with 1000 increments
  - Max z-index tracking for proper stacking

### Custom Hooks

#### `useWindowPersistence`
- ✅ **Session Persistence**: 
  - Loads window states from sessionStorage on mount
  - Saves window states on every change
  - Handles JSON serialization/deserialization
- ✅ **Initialization Control**: 
  - Prevents multiple initialization from persistence
  - One-time load on component mount

#### `useWindowContent`
- ✅ **Content Loading**: 
  - Fetches content from static HTML pages
  - Loading state tracking per window
  - Content caching to prevent redundant fetches
  - Error handling for failed loads

#### `useURLSync`
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
  - Added position tracking on drag end
  - Position saved before maximize operation
  - Original position preserved for restore
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
- **Position Tolerance**: 5px (for position comparison)

### Performance Considerations
- SessionStorage for persistence (faster than localStorage)
- Content caching to reduce fetch requests
- Selector-based Zustand subscriptions
- Efficient React rendering with proper keys
- Static page generation for SEO

---

## 🧭 Future Enhancements

### Potential Features
- [ ] Window resizing functionality
- [ ] Window content caching improvements
- [ ] Better error states for failed content loads
- [ ] Window animations for minimize/restore
- [ ] Desktop icon customization
- [ ] Window snapping to edges
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
├── components/        # React components (Window, Desktop, MenuBar)
├── stores/           # Zustand stores (windowStore)
├── hooks/            # Custom React hooks (persistence, URL sync, content)
├── utils/            # Pure utility functions (positioning, calculations)
├── data/             # Static data (window configs)
├── styles/           # CSS files (retro.css)
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

**Last Updated**: 2024  
**Maintained By**: Personal project  
**Status**: Active development
