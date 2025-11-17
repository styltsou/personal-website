/**
 * Hook for loading window content from static pages
 * Prioritizes embedded content (for SEO) then falls back to fetching
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { apps } from '@/app-config';

// Type for embedded content data
declare global {
  interface Window {
    __CONTENT_DATA__?: Record<string, string>;
  }
}

export function useWindowContent() {
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());

  // Use refs to track state without causing re-renders in callback
  const contentCacheRef = useRef<Map<string, string>>(new Map());
  const loadingRef = useRef<Set<string>>(new Set());

  // Load embedded content on mount (from initial HTML for SEO)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__CONTENT_DATA__) {
      Object.entries(window.__CONTENT_DATA__).forEach(([windowId, content]) => {
        if (content) {
          contentCacheRef.current.set(windowId, content);
        }
      });
    }
  }, []);

  const loadWindowContent = useCallback(
    async (windowId: string): Promise<string | null> => {
      const config = apps.find(w => w.type === 'app' && w.id === windowId);
      if (!config || !config.path) return null; // Only handle path-based apps

      // Check cache first (includes embedded content)
      const cached = contentCacheRef.current.get(windowId);
      if (cached) {
        return cached;
      }

      // Check if already loading
      if (loadingRef.current.has(windowId)) {
        return null;
      }

      // Mark as loading
      loadingRef.current.add(windowId);
      setLoadingContent(prev => new Set(prev).add(windowId));

      try {
        // Fallback: fetch from prerendered page if not embedded
        const response = await fetch(config.path);
        if (response.ok) {
          const html = await response.text();
          // Extract main content from the HTML response
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const main = doc.querySelector('main');
          const content = main?.innerHTML || '';

          // Cache the content
          contentCacheRef.current.set(windowId, content);

          return content;
        }
      } catch (error) {
        console.error(`Failed to load content for window ${windowId}:`, error);
      } finally {
        loadingRef.current.delete(windowId);
        setLoadingContent(prev => {
          const next = new Set(prev);
          next.delete(windowId);
          return next;
        });
      }

      return null;
    },
    []
  );

  const getContent = useCallback((windowId: string): string | undefined => {
    return contentCacheRef.current.get(windowId);
  }, []);

  const isLoading = useCallback(
    (windowId: string): boolean => {
      return loadingContent.has(windowId);
    },
    [loadingContent]
  );

  return {
    loadWindowContent,
    getContent,
    isLoading,
  };
}
