# File System

This document explains how files are handled in the desktop system, including file associations, opening files in apps, and the file opening workflow.

## Overview

The file system allows files (images, documents, etc.) to appear as desktop icons and open in their associated apps when double-clicked. This mimics real operating system behavior where files are opened by their default applications.

## File Associations

File associations map file extensions to app IDs that can open them. This is configured in `src/config/file-associations.ts`:

```typescript
export const fileAssociations: Record<string, string> = {
  // Image files
  '.jpg': 'photos',
  '.jpeg': 'photos',
  '.png': 'photos',
  '.gif': 'photos',
  '.webp': 'photos',
  '.svg': 'photos',
  '.bmp': 'photos',
  
  // Text files
  '.txt': 'notepad',
  '.md': 'notepad',
  '.log': 'notepad',
};
```

### Adding File Associations

To add support for a new file type:

1. **Add the extension mapping** in `src/config/file-associations.ts`:

   ```typescript
   export const fileAssociations: Record<string, string> = {
     // ... existing associations
     '.pdf': 'pdf-viewer', // New association
   };
   ```

2. **Ensure the app exists** in `src/app-config.ts` with the specified ID

3. **Update the app component** to handle the `filePath` prop (see below)

## Opening Files

### The `openFile` Action

Files are opened using the `openFile` action in the window store:

```typescript
openFile: (filePath: string) => void
```

**How it works:**

1. The file path is passed to `openFile(filePath)`
2. The system determines the file extension
3. Looks up the associated app in `fileAssociations`
4. Generates a unique window ID based on the file path
5. Merges the base app config with file-specific props and title
6. Reuses the same window opening logic as `openWindow` (via helper function)
7. Passes the `filePath` as a prop to the app component

**Example:**

```typescript
// In a component
const openFile = useStore(state => state.openFile);

// Open an image file
openFile('/images/me.jpg'); // Opens in Photos app
```

### File Window IDs

Each file instance gets a unique window ID to allow multiple files of the same type to be open simultaneously:

```typescript
// Window ID format: {appId}-{sanitized-file-path}
// Example: 'photos-/images-me-jpg'
const windowId = `${appId}-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`;
```

This ensures:
- Multiple files can be open at once
- Each file window is tracked separately
- Window state (position, size) is preserved per file

## App Component Integration

Apps that can open files should accept a `filePath` prop:

```typescript
export interface MyAppProps {
  filePath?: string; // When opened from a file
  // ... other props
}

export default function MyApp({ filePath }: MyAppProps) {
  if (filePath) {
    // Handle file mode
    return <FileViewer filePath={filePath} />;
  }
  
  // Handle app mode (opened directly)
  return <AppInterface />;
}
```

### Example: Photos App

The Photos app demonstrates how to handle both file and app modes:

```typescript
export interface PhotosProps {
  filePath?: string; // When opened from a file
  imagePath?: string; // Legacy support
  images?: string[]; // Gallery mode (multiple images)
}

export default function PhotosWindow({ filePath, imagePath, images }: PhotosProps) {
  // Priority: filePath > imagePath > images
  const imageToDisplay = filePath || imagePath;
  const galleryImages = images || (imageToDisplay ? [imageToDisplay] : []);

  // Single image mode (from file)
  if (galleryImages.length === 1) {
    return <ImageViewer image={galleryImages[0]} />;
  }

  // Gallery mode (multiple images)
  return <Gallery images={galleryImages} />;
}
```

**Key Points:**
- `filePath` prop is passed when file is opened via `openFile()`
- App can distinguish between file mode and app mode
- App can handle both single files and multiple files (gallery mode)

## File Configuration

Files are configured in `src/app-config.ts` alongside apps:

```typescript
{
  type: 'file',
  id: 'myself',
  title: 'me.jpg',
  filePath: '/images/me.jpg', // Path relative to public/
  desktopIcon: {
    label: 'me.jpg',
    icon: ImageFileIcon, // SVG icon component
  },
}
```

### File Paths

- Files must be placed in the `public/` directory
- Paths in config are relative to the site root (start with `/`)
- Example: `public/images/me.jpg` → `/images/me.jpg` in config

### File Icons

- Use SVG icon components for consistency with the retro aesthetic
- Icons are defined alongside app icons (e.g., `ImageFileIcon` in Photos app)
- Icons should match the visual style of app icons

## Desktop Icon Behavior

### File Icons vs App Icons

Desktop icons handle both apps and files:

```typescript
// App icon - opens app directly
if (icon.windowId) {
  openWindow(icon.windowId);
}

// File icon - opens file in associated app
if (icon.filePath) {
  openFile(icon.filePath);
}
```

**Behavior:**
- **App icons**: Double-click opens the app directly
- **File icons**: Double-click opens the file in its associated app
- Both appear on desktop if `desktopIcon` is configured
- Both support dragging and positioning

## Window Title

When a file is opened, the window title shows both the filename and app name:

```typescript
// Window title format depends on app:
// Photos app: {appTitle} - {filename} (e.g., "Photos - me.jpg")
// Other apps: {filename} - {appTitle} (e.g., "document.txt - Notepad")
title: appId === 'photos' 
  ? `${appTitle} - ${fileName}`
  : `${fileName} - ${appTitle}`
```

This makes it clear which file is open and in which app.

## Menu Bar Integration

File windows appear in the menu bar when open:

- File windows are detected by extracting the base app ID from the window ID (e.g., `photos-me.jpg` → `photos`)
- They appear after regular app windows in the menu bar
- Each file window shows its custom title (e.g., "Photos - me.jpg")
- Clicking a file window in the menu bar focuses/restores it
- File windows inherit `keepMountedWhenMinimized` setting from their base app

## Multiple File Instances

The system supports opening multiple instances of the same file type:

- Each file gets a unique window ID
- Multiple image files can be open simultaneously
- Each window maintains its own state (position, size, etc.)
- Closing one file doesn't affect others
- Each file window appears separately in the menu bar

## Persistence

File windows are persisted and restored like regular windows:

- Window state (position, size, etc.) is saved to `sessionStorage`
- On page reload, file windows are restored
- The system extracts the base app ID from the window ID to restore the component reference
- Persisted config (title, props with `filePath`) is merged with base app config
- This ensures file windows work correctly after page reload

## Error Handling

If a file cannot be opened:

1. **No association**: Console warning if file extension has no associated app
2. **App not found**: Console warning if associated app doesn't exist
3. **Component error**: App component should handle file loading errors gracefully

Example error handling in Photos app:

```typescript
<img
  src={currentImage}
  onError={e => {
    console.error('Failed to load image:', currentImage);
    // Show error message to user
  }}
/>
```

## Adding Support for New File Types

To add support for a new file type (e.g., PDF viewer):

1. **Create the app component** that accepts `filePath` prop:

   ```typescript
   export interface PdfViewerProps {
     filePath?: string;
   }

   export default function PdfViewer({ filePath }: PdfViewerProps) {
     // Render PDF viewer
   }
   ```

2. **Register the app** in `src/app-config.ts`:

   ```typescript
   {
     type: 'app',
     id: 'pdf-viewer',
     title: 'PDF Viewer',
     component: PdfViewer,
     desktopIcon: {
       icon: PdfViewerIcon,
     },
   }
   ```

3. **Add file association** in `src/config/file-associations.ts`:

   ```typescript
   export const fileAssociations: Record<string, string> = {
     // ... existing
     '.pdf': 'pdf-viewer',
   };
   ```

4. **Add file entries** (optional - for desktop icons):

   ```typescript
   {
     type: 'file',
     id: 'document',
     title: 'document.pdf',
     filePath: '/files/document.pdf',
     desktopIcon: {
       label: 'document.pdf',
       icon: PdfFileIcon,
     },
   }
   ```

## Key Files

- `src/config/file-associations.ts` - File extension to app mappings
- `src/store/window/slice.ts` - `openFile` action implementation
- `src/components/desktop-icons/index.tsx` - File icon handling
- `src/types/app.ts` - AppConfig with file support
- `src/app-config.ts` - File entries configuration

## Best Practices

1. **File Paths**: Always use absolute paths starting with `/` (relative to public/)
2. **Icon Components**: Use SVG icons for consistency with retro aesthetic
3. **Error Handling**: Apps should gracefully handle missing or invalid files
4. **Props**: Use optional `filePath` prop to distinguish file mode from app mode
5. **Type Safety**: Define typed props interfaces for app components
6. **File Associations**: Keep file associations organized by category (images, documents, etc.)

