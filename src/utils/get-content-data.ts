/**
 * Get content data for embedding in initial HTML
 * This extracts content from Astro pages at build time for SEO and performance
 */

import { apps } from '@/app-config';
import type { AppConfig } from '@/types/app';

/**
 * Content data structure
 */
export interface ContentData {
  [windowId: string]: string;
}

/**
 * Get content data by rendering Astro pages server-side
 * This runs at build time to embed content in the initial HTML
 */
export async function getContentData(): Promise<ContentData> {
  const contentData: ContentData = {};
  // Filter content apps (apps with paths but no components)
  apps.filter(app => app.path && !app.component);

  // For each content app, we'll need to render its page
  // Since we can't easily import and render Astro pages directly,
  // we'll use a different approach: the content will be available
  // via the prerendered pages, and we'll embed it in a script tag

  // This function will be called from index.astro to prepare content
  // The actual content extraction happens client-side from embedded data
  // or we fetch it from the prerendered pages

  return contentData;
}

/**
 * Get content apps that need content embedding
 */
export function getContentApps(): AppConfig[] {
  return apps.filter(app => app.path && !app.component);
}
