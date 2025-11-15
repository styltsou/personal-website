/**
 * Utility to extract content from Astro pages for embedding in initial HTML
 * This enables SEO-friendly content that's available before React hydrates
 */

import { apps } from '@/app-config';
import type { AppConfig } from '@/types/app';

/**
 * Extract main content from HTML string
 */
export function extractMainContent(html: string): string {
  // Use regex to extract main content (faster than DOMParser on server)
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return mainMatch ? mainMatch[1].trim() : '';
}

/**
 * Get all content-based app configs
 */
export function getContentApps(): AppConfig[] {
  return apps.filter((app) => app.path && !app.component);
}

/**
 * Content data structure for embedding
 */
export interface ContentData {
  [windowId: string]: string;
}

/**
 * Prepare content data for embedding in HTML
 * This will be populated at build time with pre-rendered content
 */
export function prepareContentData(): ContentData {
  const contentData: ContentData = {};
  const contentApps = getContentApps();
  
  // This will be populated by the build process
  // For now, return empty object - content will be fetched client-side as fallback
  contentApps.forEach((app) => {
    if (app.path) {
      contentData[app.id] = ''; // Will be populated during build
    }
  });
  
  return contentData;
}

