# Loading Flash Issue - Fix Documentation

## Problem Description

When the page reloaded, users experienced two visual issues:

1. **Theme Flash**: The app would briefly appear in light theme before switching to the user's preferred theme (dark/light)
2. **Content Flash**: The desktop would appear empty for a moment, then windows would suddenly pop in, creating a jarring visual experience

## Root Causes

### 1. Theme Flash

**Why it happened:**
- The theme preference was stored in `localStorage`
- The `ThemeToggle` component initialized the theme in a `useEffect` hook, which runs **after** React renders
- This meant:
  1. Page loads → React renders with default (light) theme
  2. `useEffect` runs → Reads `localStorage` → Applies theme class
  3. Result: Visible flash of light theme before dark theme is applied

**The Problem:**
```tsx
// ThemeToggle component - runs AFTER first render
useEffect(() => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  // ... apply theme
}, []); // Too late! Page already rendered with default theme
```

### 2. Content Flash

**Why it happened:**
- Windows were persisted to `sessionStorage` and restored in a `useEffect` hook
- The restoration process happened asynchronously after React's first render
- This meant:
  1. Page loads → Desktop renders with empty `windowStates` array
  2. `useEffect` runs → Loads from `sessionStorage` → Restores windows
  3. Result: Empty desktop briefly, then windows suddenly appear

**The Problem:**
```tsx
// useWindowPersistence - runs AFTER first render
useEffect(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  // ... restore windows
}, []); // Too late! Desktop already rendered empty
```

## Solutions Implemented

### 1. Theme Initialization (Blocking Script)

**Fix:** Added a blocking script in `BaseLayout.astro` that runs **before** React renders

**Location:** `src/layouts/BaseLayout.astro`

```html
<!-- Initialize theme before React renders to prevent flash -->
<script define:inline>
  (function () {
    const THEME_STORAGE_KEY = 'retro-theme-preference';
    
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    let shouldBeDark = false;

    if (savedTheme === 'dark' || savedTheme === 'light') {
      shouldBeDark = savedTheme === 'dark';
    } else {
      // No saved preference, use system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    }

    // Apply theme class immediately (before React renders)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  })();
</script>
```

**Why this works:**
- Scripts in `<head>` execute synchronously before React hydration
- Theme class is applied to `<html>` element before any rendering
- No flash because the correct theme is active from the start

**Updated ThemeToggle:**
- Now syncs with the pre-initialized theme instead of initializing it
- Prevents conflicts and ensures consistency

### 2. Smooth Content Loading (Fade-in Transition)

**Fix:** Added a fade-in transition that waits for persistence to load

**Location:** `src/components/desktop/index.tsx` and `src/components/desktop/styles.module.scss`

**Changes:**

1. **Desktop Component** - Tracks persistence loading state:
```tsx
const hasLoadedFromPersistence = useWindowStore(
  (state) => state.hasLoadedFromPersistence
);

// Apply 'loaded' class when persistence is ready
<div className={cn('desktop', styles.desktop, hasLoadedFromPersistence && styles.loaded)}>
```

2. **CSS Transition** - Smooth fade-in:
```scss
.desktop {
  opacity: 0;
  transition: opacity 0.2s ease-in;

  &.loaded {
    opacity: 1;
  }
}
```

3. **Window Store** - Smart initialization:
```tsx
// Check synchronously if there's saved state
let initialHasLoadedFromPersistence = false;
if (typeof window !== 'undefined') {
  try {
    const saved = sessionStorage.getItem('desktop-windows');
    if (saved) {
      // Has saved state - will load async, start hidden
      initialHasLoadedFromPersistence = false;
    } else {
      // No saved state - show immediately
      initialHasLoadedFromPersistence = true;
    }
  } catch {
    initialHasLoadedFromPersistence = true;
  }
}
```

**Why this works:**
- If no saved state exists → Desktop fades in immediately (no delay)
- If saved state exists → Desktop waits for restoration → Fades in smoothly
- 0.2s transition prevents jarring appearance
- Content appears gracefully instead of popping in

### 3. Persistence Hook Optimization

**Location:** `src/hooks/use-window-persistence.ts`

**Changes:**
- Checks if persistence has already been loaded before attempting to load
- Handles the case where no saved state exists (marks as loaded immediately)
- Prevents double initialization

## Technical Details

### Execution Order (After Fix)

1. **HTML Parsing** → Blocking script in `<head>` executes
   - Theme class applied to `<html>` element
   - Synchronous, happens before any rendering

2. **React Hydration** → Desktop component mounts
   - Checks `hasLoadedFromPersistence` state
   - If no saved state: `opacity: 1` immediately
   - If saved state: `opacity: 0` (will fade in after load)

3. **useEffect Hooks** → Run after first render
   - `useWindowPersistence` loads from `sessionStorage`
   - Restores windows and sets `hasLoadedFromPersistence: true`
   - Desktop fades in smoothly

### Key Insight

The fundamental issue was **timing**: React's `useEffect` runs after the first render, but we needed initialization to happen **before** rendering. The solution uses:

1. **Blocking scripts** for synchronous initialization (theme)
2. **CSS transitions** for smooth visual feedback (content)
3. **Smart state management** to minimize delays when possible

## Files Modified

1. `src/layouts/BaseLayout.astro` - Added blocking theme script
2. `src/components/menu-bar/theme-toggle/index.tsx` - Updated to sync with pre-initialized theme
3. `src/components/desktop/index.tsx` - Added loading state tracking
4. `src/components/desktop/styles.module.scss` - Added fade-in transition
5. `src/store/window/slice.ts` - Added synchronous persistence check
6. `src/hooks/use-window-persistence.ts` - Optimized loading logic

## Result

- ✅ No theme flash - Theme applied before React renders
- ✅ Smooth content appearance - Fade-in transition instead of jarring pop-in
- ✅ Better UX - Professional, polished loading experience
- ✅ No performance impact - Optimizations ensure minimal delay when possible

## Related Issues

This fix also resolved a related issue where custom app windows (Terminal, Music Player, etc.) would show "No content available" on page refresh. The fix for that was in `initializeFromPersistence` to restore the full `config` object (including React component references) from the `apps` array, since component references are lost during JSON serialization.

