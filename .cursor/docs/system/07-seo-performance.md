# SEO and Performance Optimizations

This document explains the SEO and performance optimizations implemented to make the site faster and more search-engine friendly.

## Overview

The site uses a hybrid approach combining Astro's static generation capabilities with React islands for interactivity. This provides the best of both worlds: fast, SEO-friendly content pages and interactive React components.

## Performance Optimizations

### 1. Hybrid Output Mode

**Configuration:** `astro.config.mjs`
```javascript
export default defineConfig({
  output: 'hybrid', // Enable static generation
  // ...
});
```

**Benefits:**
- Static pages are pre-rendered at build time
- Faster page loads (no server processing needed)
- Better caching (CDN-friendly)
- Lower server costs

**What Gets Prerendered:**
- All content pages (about, projects, contact) - marked with `export const prerender = true`
- Home page (index.astro)

### 2. React Island Hydration Strategy

**Before:** `client:load` - React loads immediately
```astro
<Desktop client:load />
```

**After:** `client:idle` - React loads when browser is idle
```astro
<Desktop client:idle />
```

**Benefits:**
- Faster initial page load
- Better Core Web Vitals (LCP, FID)
- Content visible before React hydrates
- Progressive enhancement

**How It Works:**
- Browser loads HTML and CSS first
- Content is immediately visible
- React loads after browser idle time
- Desktop becomes interactive after hydration

### 3. Content Embedding

**Implementation:** Content extracted at build time and embedded in initial HTML

**Location:** `src/pages/index.astro`

```astro
---
// Extract content from shared components at build time
const contentData: Record<string, string> = {};
// ... extraction logic ...
---

<script define:inline>
  window.__CONTENT_DATA__ = {JSON.stringify(contentData)};
</script>
```

**Benefits:**
- **Zero network requests** for embedded content
- **Instant window opening** - content available immediately
- **SEO-friendly** - content in initial HTML
- **Better UX** - no loading spinner for embedded content

**What Gets Embedded:**
- Only path-based apps (about, projects, contact)
- Component-based apps (terminal, CV, etc.) are NOT embedded (not needed for SEO)

### 4. Shared Content Components

**Structure:**
```
src/components/content/
  ├── about-content.astro
  ├── projects-content.astro
  └── contact-content.astro
```

**Benefits:**
- Single source of truth for content
- Reusable in both Astro pages and embedded data
- Easier maintenance
- Consistent content structure

**Usage:**
```astro
---
// In Astro pages
import AboutContent from '../components/content/about-content.astro';
---

<BaseLayout>
  <AboutContent />
</BaseLayout>
```

## SEO Optimizations

### 1. Static Generation

All content pages are statically generated:

```astro
---
export const prerender = true; // Static generation
---
```

**Benefits:**
- Content available in initial HTML
- Search engines can crawl immediately
- No JavaScript required to see content
- Better indexing

### 2. Structured Data (JSON-LD)

All content pages include structured data:

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

**Benefits:**
- Helps search engines understand page content
- Can enable rich snippets in search results
- Better semantic understanding
- Improved discoverability

### 3. Meta Tags

All pages include comprehensive meta tags via `BaseLayout.astro`:

- **Primary Meta Tags**: title, description
- **Open Graph**: For social media sharing
- **Twitter Cards**: For Twitter sharing
- **Canonical URLs**: Prevent duplicate content issues

### 4. Content in Initial HTML

Content is embedded in the initial HTML:

**Before (Client-Side Fetching):**
- Content fetched after React loads
- Not visible to search engines initially
- Requires JavaScript

**After (Build-Time Embedding):**
- Content in initial HTML
- Visible to search engines immediately
- Works without JavaScript (progressive enhancement)

### 5. Sitemap Generation

Sitemap is automatically generated via `@astrojs/sitemap`:

**Configuration:** `astro.config.mjs`
```javascript
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    sitemap(),
    // ...
  ],
});
```

**Benefits:**
- Helps search engines discover all pages
- Automatically updated on build
- Includes all prerendered pages

## Scope of Optimizations

### Path-Based Apps (SEO-Optimized)

These apps get full SEO treatment:
- ✅ `about` - About Me page
- ✅ `projects` - Projects page
- ✅ `contact` - Contact page

**Optimizations Applied:**
- Static generation
- Content embedding
- Structured data
- Meta tags

### Component-Based Apps (Not SEO-Optimized)

These apps are client-side only (no SEO needed):
- ❌ `terminal` - Interactive terminal
- ❌ `cv` - PDF viewer
- ❌ `wikipedia` - Wikipedia viewer
- ❌ `flappy-bird` - Game
- ❌ `piano` - Interactive piano
- ❌ `music-player` - Music player

**Why Not SEO:**
- These are interactive applications
- Not meant to be indexed by search engines
- Content is dynamic/interactive
- No static content to index

## Performance Metrics

### Before Optimizations

- React loads immediately (`client:load`)
- Content fetched on window open
- No content in initial HTML
- Slower initial page load

### After Optimizations

- React loads when idle (`client:idle`)
- Content embedded in HTML
- Instant window opening (no fetch)
- Faster initial page load
- Better Core Web Vitals

## Key Files

- `astro.config.mjs` - Hybrid mode configuration
- `src/pages/index.astro` - Content extraction and embedding
- `src/components/content/*.astro` - Shared content components
- `src/hooks/use-window-content.ts` - Content loading (embedded + fetch)
- `src/pages/*.astro` - Content pages with SEO optimizations
- `src/layouts/BaseLayout.astro` - Meta tags and structured data

## Best Practices

### Adding New Content Pages

1. **Create shared content component:**
   ```astro
   // src/components/content/new-page-content.astro
   <main>
     <!-- Content here -->
   </main>
   ```

2. **Create Astro page:**
   ```astro
   // src/pages/new-page.astro
   ---
   import BaseLayout from '../layouts/BaseLayout.astro';
   import NewPageContent from '../components/content/new-page-content.astro';
   
   export const prerender = true;
   ---
   
   <BaseLayout title="..." description="...">
     <script type="application/ld+json" set:html={...} />
     <NewPageContent />
   </BaseLayout>
   ```

3. **Add to apps config:**
   ```typescript
   // src/data/apps.ts
   { id: 'new-page', title: 'New Page', path: '/new-page', pinned: true }
   ```

4. **Add to content extraction:**
   ```astro
   // src/pages/index.astro
   import NewPageContent from '../components/content/new-page-content.astro';
   // Add to contentComponents mapping
   ```

### Performance Monitoring

- Use Lighthouse to measure Core Web Vitals
- Monitor LCP (Largest Contentful Paint)
- Track FID (First Input Delay)
- Check CLS (Cumulative Layout Shift)

## Future Enhancements

Potential improvements:
- Image optimization (Astro Image component)
- Font optimization (font-display: swap)
- Service worker for offline support
- Prefetching for faster navigation
- More granular structured data
- Breadcrumb navigation schema
- Person schema for about page
- Project schema for projects page

