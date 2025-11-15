# App Configuration System

This document explains how apps are configured, registered, and integrated into the desktop system.

## Overview

All apps are centrally registered in `src/data/apps.ts`. This file serves as the single source of truth for:
- Available apps
- App metadata
- Desktop icon configuration
- Window behavior settings

## App Configuration

### AppConfig Interface

Each app is defined with an `AppConfig` object. The type is defined in `src/types/app.ts`:

```typescript
import type { AppConfig } from '@/types/app';

interface AppConfig {
  id: string;                    // Unique identifier
  title: string;                  // Window title
  path?: string;                  // Optional: URL path for content-based apps
  icon?: string;                  // Optional: Icon path (for menu bar)
  pinned?: boolean;               // Whether to show in menu bar
  resizeConstraint?: ResizeConstraint; // Resize behavior (from @/types/window)
  component?: ComponentType;      // Optional: Custom React component
  desktopIcon?: {                 // Optional: Desktop icon configuration
    label?: string;                // Icon label (defaults to title)
    icon: string | ComponentType; // Icon component or image path
  };
}
```

## App Types

### Content-Based Apps

Apps that load content from Astro pages:

```typescript
{
  id: 'about',
  title: 'About Me',
  path: '/about',  // Loads content from src/pages/about.astro
  pinned: true
}
```

**How it works:**
- When opened, the window fetches HTML from the `path`
- Content is extracted from the `<main>` element
- HTML is injected into the window using `dangerouslySetInnerHTML`
- Content is cached after first load

### Component-Based Apps

Apps that use custom React components:

```typescript
{
  id: 'terminal',
  title: 'Terminal',
  component: TerminalWindow,  // React component
  desktopIcon: {
    icon: TerminalIcon
  }
}
```

**How it works:**
- Component is rendered directly in the window
- No content loading needed
- Full React component capabilities

## Desktop Icons

### Icon Configuration

To appear as a desktop icon, an app must have a `desktopIcon` property:

```typescript
{
  id: 'music-player',
  title: 'MusicPlayer Pro v1.0',
  component: MusicPlayerContent,
  desktopIcon: {
    label: 'Music',           // Optional: defaults to title
    icon: MusicPlayerIcon     // React component or image path
  }
}
```

**Icon Generation:**
- Icons are automatically generated from apps with `desktopIcon`
- Only these apps appear on the desktop
- Icons are positioned using the grid system

## Resize Constraints

Apps can specify resize behavior. The `ResizeConstraint` type is defined in `src/types/window.ts`:

- `'none'` (default): Full resize capability (all edges and corners)
- `'diagonal'`: Only corner handles (e.g., Flappy Bird game)
- `'disabled'`: No resizing allowed (e.g., Piano)

```typescript
{
  id: 'piano',
  title: 'Virtual Piano',
  resizeConstraint: 'disabled',
  component: PianoWindow
}
```

## Pinned Apps

Apps with `pinned: true` appear in the menu bar:

```typescript
{
  id: 'about',
  title: 'About Me',
  path: '/about',
  pinned: true  // Shows in menu bar
}
```

## App Registration

### Adding a New App

1. **Create the app component** (if component-based):
   ```
   src/components/apps/my-app/
   ├── index.tsx      # Main component
   ├── icon.tsx       # Icon component (if needed)
   └── styles.module.scss
   ```

2. **Register in `apps.ts`**:
   ```typescript
   import MyAppWindow, { MyAppIcon } from '../components/apps/my-app';
   
   export const apps: AppConfig[] = [
     // ... existing apps
     {
       id: 'my-app',
       title: 'My App',
       component: MyAppWindow,
       desktopIcon: {
         icon: MyAppIcon
       }
     }
   ];
   ```

3. **That's it!** The app will:
   - Appear as a desktop icon (if `desktopIcon` is set)
   - Be openable via the window system
   - Have its state managed automatically

## Window State Integration

When a window is opened:
1. App config is looked up by `id` in `apps.ts`
2. `WindowState` is created with the `config` reference
3. Window component receives the config
4. Content is loaded or component is rendered based on config type

**Important**: The full `config` object is stored in `WindowState`, so all app metadata is available to the window component.

## Persistence Considerations

When windows are persisted to `sessionStorage`:
- Component references are lost (can't serialize functions)
- On restore, config is re-looked up from `apps.ts` by `id`
- Full config (including component) is restored

This ensures component-based apps work correctly after page reload.

## App Discovery

The system discovers apps in several ways:

1. **Desktop Icons**: Apps with `desktopIcon` appear on desktop
2. **Menu Bar**: Apps with `pinned: true` appear in menu bar
3. **URL Navigation**: Apps with `path` can be opened via URL
4. **Programmatic**: Any app can be opened via `openWindow(id)`

## Key Files

- `src/data/apps.ts` - Central app registry
- `src/types/app.ts` - AppConfig type definition
- `src/types/window.ts` - Window-related types (ResizeConstraint, WindowState, etc.)
- `src/components/desktop-icons/index.tsx` - Icon generation from apps
- `src/stores/window-store.ts` - Uses apps config when opening windows

## Best Practices

1. **Unique IDs**: Use kebab-case, descriptive IDs
2. **Consistent Naming**: Match component names to app IDs
3. **Icon Components**: Export icon as named export from app component
4. **Type Safety**: Use TypeScript types for app config
5. **Single Source**: Keep all app definitions in `apps.ts`

