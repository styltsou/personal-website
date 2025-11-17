# App Configuration System

This document explains how apps and files are configured, registered, and integrated into the desktop system.

## Overview

All apps and files are centrally registered in `src/app-config.ts`. This unified configuration serves as the single source of truth for:

- Available apps
- Desktop files (images, documents, etc.)
- App metadata
- Desktop icon configuration
- Window behavior settings

## Unified Configuration

The system uses a unified `AppConfig` interface that supports both apps and files through a `type` field. This provides a single, consistent way to configure everything that appears on the desktop.

### AppConfig Interface

Each entry (app or file) is defined with an `AppConfig` object. The type is defined in `src/types/app.ts`:

```typescript
import type { AppConfig } from '@/types/app';

interface AppConfig<TProps = Record<string, any>> {
  type: 'app' | 'file'; // Distinguishes between apps and files
  id: string; // Unique identifier
  title: string; // Window title or file name
  
  // File-specific fields (only for type: 'file')
  filePath?: string; // Path to the file (required for type: 'file')
  
  // App-specific fields (only for type: 'app')
  path?: string; // Optional: URL path for content-based apps
  icon?: string; // Optional: Icon path (for menu bar)
  pinned?: boolean; // Whether to show in menu bar (defaults to false)
  resizable?: boolean; // Whether window can be resized (defaults to true)
  minSize?: WindowSize; // Optional app-specific minimum window size
  initialSize?: WindowSize; // Optional initial window size when opening for the first time
  component?: ComponentType<TProps>; // Optional: Custom React component
  props?: TProps; // Optional props to pass to the component
  keepMountedWhenMinimized?: boolean; // Whether to keep component mounted when minimized (default: false)
  
  // Desktop icon configuration (for both apps and files)
  desktopIcon?: {
    label?: string; // Icon label (defaults to title)
    icon: string | ComponentType; // Icon component or image path
  };
}
```

**Key Points:**
- The `type` field determines whether an entry is an app or a file
- Files use `filePath` to specify the file location
- Apps use `component`, `path`, and other app-specific fields
- Both can have `desktopIcon` to appear on the desktop
- Apps can receive typed props via the generic `TProps` parameter

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
- By default, component unmounts when window is minimized (saves memory)
- Set `keepMountedWhenMinimized: true` to keep component mounted when minimized (allows background processes)
- Component always unmounts when window is closed

## Files

Files can be added to the desktop and will open in their associated apps when double-clicked. See the [File System documentation](./08-file-system.md) for details on file associations and the `openFile` action.

### File Configuration

To add a file to the desktop:

```typescript
{
  type: 'file',
  id: 'myself',
  title: 'me.jpg',
  filePath: '/images/me.jpg', // Path relative to public/ directory
  desktopIcon: {
    label: 'me.jpg',
    icon: ImageFileIcon, // SVG icon component (recommended for retro aesthetic)
  },
}
```

**How it works:**
- Files appear as desktop icons (if `desktopIcon` is set)
- When double-clicked, the file opens in its associated app (determined by file extension)
- The file path is passed to the app component via the `filePath` prop
- Each file instance gets a unique window ID based on the file path

**File Paths:**
- Files in the `public/` directory are served at the root
- Example: `public/images/me.jpg` → `/images/me.jpg`
- Use absolute paths starting with `/` in the config

## Desktop Icons

### Icon Configuration

To appear as a desktop icon, an app or file must have a `desktopIcon` property:

```typescript
// App icon
{
  type: 'app',
  id: 'music-player',
  title: 'MusicPlayer Pro v1.0',
  component: MusicPlayer,
  desktopIcon: {
    label: 'Music',           // Optional: defaults to title
    icon: MusicPlayerIcon     // React component or image path
  }
}

// File icon
{
  type: 'file',
  id: 'myself',
  title: 'me.jpg',
  filePath: '/images/me.jpg',
  desktopIcon: {
    label: 'me.jpg',
    icon: ImageFileIcon,      // SVG icon component (recommended)
  },
}
```

**Note**: For apps that need providers or context (like the music player), the component should be a wrapper that includes the provider. This ensures the provider only mounts when the window is rendered.

**Icon Generation:**

- Icons are automatically generated from entries with `desktopIcon`
- Both apps and files can have desktop icons
- Icons are positioned using the grid system
- SVG icon components are recommended for consistency with the retro aesthetic

## Resize Behavior

Apps can control whether windows can be resized using the `resizable` boolean field:

- `resizable: true` (default): Window can be resized from any handle (vertical, horizontal, corner)
- `resizable: false`: Window cannot be resized at all

```typescript
{
  id: 'piano',
  title: 'Virtual Piano',
  resizable: false, // Disable resizing
  component: PianoWindow
}
```

**Note**: If `resizable` is not specified, it defaults to `true`, allowing full resize capability.

## Window Sizing

### Minimum Size

Apps can specify a custom minimum window size. If not specified, a global default is used (800x600):

```typescript
{
  id: 'music-player',
  title: 'MusicPlayer Pro v1.0',
  minSize: { width: 900, height: 700 }, // Custom minimum size
  component: MusicPlayer
}
```

### Initial Size

Apps can specify a custom initial window size when opening for the first time. If not specified, a global default is used (1100x800):

```typescript
{
  id: 'my-app',
  title: 'My App',
  initialSize: { width: 1200, height: 900 }, // Custom initial size
  component: MyAppWindow
}
```

**Note**: 
- `minSize` defaults to global minimum if not specified
- `initialSize` defaults to global default size if not specified
- When a window is restored from a previous session, it uses the saved size (not `initialSize`)

## Pinned Apps

Apps with `pinned: true` appear in the menu bar, even when the window is closed:

```typescript
{
  id: 'about',
  title: 'About Me',
  path: '/about',
  pinned: true  // Shows in menu bar (even when closed)
}
```

**Behavior:**
- Pinned windows appear in the menu bar at all times (when open or closed)
- Unpinned windows only appear in the menu bar when they are open
- File windows also appear in the menu bar when open (extracted from window ID)
- Menu bar shows: pinned apps first (in app config order), then open apps (in order of opening), then file windows
- The `pinned` field defaults to `false` if not specified
- Window state tracks `isPinned` separately for future dynamic pinning/unpinning support

## Keeping Windows Mounted When Minimized

Apps can opt-in to stay mounted when minimized by setting `keepMountedWhenMinimized: true`:

```typescript
{
  id: 'music-player',
  title: 'MusicPlayer Pro v1.0',
  component: MusicPlayer,
  keepMountedWhenMinimized: true, // Keep mounted for background playback
}
```

**Behavior:**
- Default is `false` - windows unmount when minimized (saves memory)
- Set to `true` to keep component mounted when minimized (allows background processes)
- Component is hidden with `display: none` but remains in React tree
- Useful for apps that need to run in background (music player, downloads, etc.)
- Component always unmounts when window is closed, regardless of this setting

## App Registration

### Adding a New App

1. **Create the app component** (if component-based):

   ```
   src/components/apps/my-app/
   ├── index.tsx      # Main component
   ├── icon.tsx       # Icon component (if needed)
   └── styles.module.scss
   ```

2. **Register in `app-config.ts`**:

   ```typescript
   import MyAppWindow, { MyAppIcon } from '../components/apps/my-app';

   export const apps: AppConfig[] = [
     // ... existing apps
     {
       type: 'app',
       id: 'my-app',
       title: 'My App',
       component: MyAppWindow,
       desktopIcon: {
         icon: MyAppIcon,
       },
     },
   ];
   ```

3. **That's it!** The app will:
   - Appear as a desktop icon (if `desktopIcon` is set)
   - Be openable via the window system
   - Have its state managed automatically

### Adding a New File

1. **Place the file in the `public/` directory**:

   ```
   public/
     └── images/
         └── my-image.jpg
   ```

2. **Register in `app-config.ts`**:

   ```typescript
   import { ImageFileIcon } from '../components/apps/photos';

   export const apps: AppConfig[] = [
     // ... existing entries
     {
       type: 'file',
       id: 'my-image',
       title: 'my-image.jpg',
       filePath: '/images/my-image.jpg',
       desktopIcon: {
         label: 'my-image.jpg',
         icon: ImageFileIcon,
       },
     },
   ];
   ```

3. **Ensure file association exists** (see [File System documentation](./08-file-system.md)):
   - The file extension must be mapped to an app in `src/config/file-associations.ts`
   - Example: `.jpg` → `photos` app

4. **That's it!** The file will:
   - Appear as a desktop icon
   - Open in its associated app when double-clicked
   - Pass the file path to the app component via props

## Window State Integration

When a window is opened:

1. App config is looked up by `id` in `app-config.ts`
2. `WindowState` is created with the `config` reference
3. Window component receives the config
4. Content is loaded or component is rendered based on config type

**Important**: The full `config` object is stored in `WindowState`, so all app metadata is available to the window component.

## Persistence Considerations

When windows are persisted to `sessionStorage`:

- Component references are lost (can't serialize functions)
- On restore, config is re-looked up from `app-config.ts` by `id`
- Full config (including component) is restored

This ensures component-based apps work correctly after page reload.

## App Discovery

The system discovers apps in several ways:

1. **Desktop Icons**: Apps and files with `desktopIcon` appear on desktop
2. **Menu Bar**: Apps with `pinned: true` appear in menu bar (files don't appear in menu bar)
3. **URL Navigation**: Apps with `path` can be opened via URL
4. **Programmatic**: Any app can be opened via `openWindow(id)`
5. **File Opening**: Files can be opened via `openFile(filePath)` which opens them in their associated app

## Key Files

- `src/app-config.ts` - Central registry for apps and files
- `src/types/app.ts` - AppConfig type definition
- `src/types/window.ts` - Window-related types (WindowState, WindowPosition, WindowSize, etc.)
- `src/components/desktop-icons/index.tsx` - Icon generation from apps and files
- `src/store/window/slice.ts` - Uses config when opening windows and files
- `src/config/file-associations.ts` - File extension to app mappings

## Best Practices

1. **Unique IDs**: Use kebab-case, descriptive IDs
2. **Consistent Naming**: Match component names to app IDs
3. **Icon Components**: Export icon as named export from app component
4. **Type Safety**: Use TypeScript types for app config
5. **Single Source**: Keep all app definitions in `app-config.ts`
