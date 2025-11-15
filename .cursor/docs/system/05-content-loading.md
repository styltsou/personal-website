# Content Loading System

This document explains how content-based windows load their content from Astro pages, including the fetching, parsing, caching, and rendering process.

## Overview

Content-based windows (apps with a `path` property) load their HTML content from the corresponding Astro page. The content is fetched, parsed, cached, and rendered in the window.

## Content-Based vs Component-Based

### Content-Based Apps

Apps with a `path` property:
```typescript
{
  id: 'about',
  title: 'About Me',
  path: '/about'  // Loads from src/pages/about.astro
}
```

**Characteristics:**
- Content is static HTML from Astro pages
- Loaded asynchronously when window opens
- Cached after first load
- Supports SEO (content is in HTML)

### Component-Based Apps

Apps with a `component` property:
```typescript
{
  id: 'terminal',
  title: 'Terminal',
  component: TerminalWindow  // Rendered directly
}
```

**Characteristics:**
- React component rendered directly
- No content loading needed
- Full React capabilities
- Not SEO-friendly (client-side only)

## Content Loading Process

### 1. Window Opening

When a content-based window is opened:

1. **Window State Created**: Window is added to `windowStates` with empty `content`
2. **Content Check**: Desktop component checks if content needs loading
3. **Loading Triggered**: `loadWindowContent()` is called if:
   - Window has a `path` (content-based)
   - Content is not already loaded
   - Not currently loading

### 2. Content Loading Strategy

The system uses a two-tier approach for optimal performance and SEO:

#### Tier 1: Embedded Content (Build Time)
- Content is extracted from Astro pages at **build time**
- Embedded directly in the initial HTML via `window.__CONTENT_DATA__`
- **Instant access** - no network request needed
- **SEO-friendly** - content is in initial HTML for search engines

#### Tier 2: Fallback Fetching (Runtime)
- If embedded content not available, falls back to fetching
- Fetches from prerendered Astro pages
- Same parsing and caching as before

### 3. Content Fetching Hook

The `use-window-content.ts` hook handles both strategies:

```typescript
loadWindowContent(windowId: string): Promise<string | null>
```

**Process:**
1. **Embedded Content Check**: Check `window.__CONTENT_DATA__` (loaded on mount)
2. **Cache Check**: Check if content is already cached in memory
3. **Loading Check**: Prevent duplicate requests if already loading
4. **Mark Loading**: Set loading state for this window
5. **Fetch HTML** (fallback): `fetch(config.path)` - fetches the prerendered Astro page
6. **Parse HTML**: Extract content from `<main>` element
7. **Cache Content**: Store in memory cache
8. **Update State**: Update window's `content` property

### 4. HTML Parsing

The fetched HTML is parsed to extract only the relevant content:

```typescript
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const main = doc.querySelector('main');
const content = main?.innerHTML || '';
```

**Why extract `<main>`?**
- Astro pages include full HTML structure (head, body, etc.)
- Only the `<main>` content is needed in the window
- Prevents duplicate head/body elements
- Keeps window content clean

### 4. Content Caching

Content is cached in memory to avoid re-fetching:

- **Cache Key**: Window ID
- **Cache Storage**: `Map<string, string>` (ref-based, doesn't cause re-renders)
- **Cache Lifetime**: Until page reload
- **Cache Invalidation**: Automatic on page reload

**Benefits:**
- Faster subsequent opens
- Reduced network requests
- Better performance

### 5. Content Rendering

Content is rendered in the window component:

```tsx
{windowState.content && (
  <div
    className={styles.htmlContent}
    dangerouslySetInnerHTML={{ __html: windowState.content }}
  />
)}
```

**Security Note**: `dangerouslySetInnerHTML` is used because content comes from trusted Astro pages, not user input.

## Loading States

### Loading Indicator

While content is loading:
- `isLoading(windowId)` returns `true`
- Loading progress bar appears at top of window
- Window shows loading state

### Loading Flow

1. **Window Opens**: `content` is `undefined`, `isLoading` is `true`
2. **Content Fetched**: Loading state tracked in hook
3. **Content Parsed**: HTML extracted and cached
4. **Content Rendered**: `content` set in window state, `isLoading` becomes `false`

## Error Handling

If content loading fails:
- Error is logged to console
- Loading state is cleared
- Window shows "No content available" message
- User can retry by closing and reopening

## Performance Optimizations

### 1. Build-Time Content Embedding

Content is extracted and embedded at build time:
- **Zero network requests** for embedded content
- **Instant window opening** - content available immediately
- **SEO-friendly** - content in initial HTML
- Only applies to path-based apps (about, projects, contact)

**Implementation:**
- Content components in `src/components/content/`
- Extracted in `src/pages/index.astro` at build time
- Embedded via `window.__CONTENT_DATA__` script tag

### 2. Content Caching

Content is cached after first load:
- Embedded content loaded on mount (no fetch needed)
- Fetched content cached in memory
- Subsequent opens are instant
- Memory-efficient (only active windows)

### 3. Loading Prevention

Duplicate requests are prevented:
- Loading state tracked per window
- If already loading, return early
- Prevents race conditions

### 4. Selective Loading

Only content-based windows load content:
- Component-based windows skip loading
- Check: `if (!ws.config.path) return;`
- Reduces unnecessary work

### 5. React Island Optimization

Desktop component uses `client:idle` hydration:
- React loads after browser is idle
- Faster initial page load
- Better Core Web Vitals scores

## Integration Points

### Desktop Component

The Desktop component orchestrates content loading:

```typescript
useEffect(() => {
  windowStates.forEach((ws) => {
    // Skip component-based windows
    if (!ws.config.path) return;
    
    // Load if needed
    if (!ws.content && !isLoading(ws.id)) {
      loadWindowContent(ws.id).then((content) => {
        if (content) {
          updateWindowContent(ws.id, content);
        }
      });
    }
  });
}, [windowStates, loadWindowContent, isLoading]);
```

### Window Component

The Window component renders content:

```typescript
// Try custom component first
if (windowState.config.component) {
  return React.createElement(windowState.config.component);
}

// Fall back to content
if (windowState.content) {
  return <div dangerouslySetInnerHTML={{ __html: windowState.content }} />;
}

// Show loading or no content
if (!isLoading(windowState.id)) {
  return <div>No content available</div>;
}
```

## Astro Page Structure

### Shared Content Components

Content is organized using shared components for reusability:

**Structure:**
```
src/components/content/
  ├── about-content.astro
  ├── projects-content.astro
  └── contact-content.astro
```

**Benefits:**
- Content can be used in both Astro pages and embedded for windows
- Single source of truth for content
- Easier maintenance

**Example content component:**
```astro
---
// src/components/content/about-content.astro
---

<main class="mx-auto max-w-4xl p-6">
  <h1 class="mb-4 text-3xl font-bold">About Me</h1>
  <div class="prose prose-lg">
    <p>Content here...</p>
  </div>
</main>
```

**Example Astro page using component:**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AboutContent from '../components/content/about-content.astro';

export const prerender = true; // Static generation for SEO
---

<BaseLayout
  title="about me - styltsou"
  description="Learn more about my background..."
>
  <AboutContent />
</BaseLayout>
```

### Requirements

For content-based windows to work, Astro pages should:

1. **Have a `<main>` element**: Content is extracted from here
2. **Be accessible**: Page must be fetchable at the `path`
3. **Contain meaningful content**: HTML should be self-contained
4. **Use shared content components**: For build-time extraction
5. **Mark as prerendered**: `export const prerender = true` for static generation

## Key Files

- `src/hooks/use-window-content.ts` - Content loading hook (embedded + fetch)
- `src/components/desktop/index.tsx` - Triggers content loading
- `src/components/window/index.tsx` - Renders content
- `src/store/window/slice.ts` - Stores content in window state
- `src/components/content/*.astro` - Shared content components
- `src/pages/index.astro` - Extracts and embeds content at build time
- `src/utils/get-content-data.ts` - Utility for content extraction
- `src/utils/content-extractor.ts` - Content extraction helpers

## SEO Optimizations

### Structured Data (JSON-LD)

Content pages include structured data for better SEO:

```astro
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "About Me - styltsou",
  "description": "Learn more about my background...",
  "url": canonicalURL.toString(),
  "inLanguage": "en"
})} />
```

### Static Generation

All content pages are marked for static generation:
- `export const prerender = true` in each page
- Pre-rendered at build time for optimal performance
- Content available in initial HTML for search engines

### Content Embedding

Content is embedded in initial HTML:
- Available immediately for search engine crawlers
- No JavaScript required to see content
- Better Core Web Vitals scores

## Limitations

1. **No Dynamic Content**: Content is static HTML, no React interactivity
2. **No Client-Side Routing**: Each page is a separate fetch (if not embedded)
3. **Cache Lifetime**: Memory cache clears on page reload (embedded content persists)
4. **SEO Scope**: Only path-based apps get SEO treatment (component-based apps are client-side only)

## Future Enhancements

Potential improvements:
- Persistent cache (localStorage) for fetched content
- Prefetching for faster loads
- Streaming content loading
- Error retry mechanism
- Content versioning
- More granular structured data (Person schema, Project schema, etc.)

