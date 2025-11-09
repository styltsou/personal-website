/**
 * Hook for loading window content from static pages
 */

import { useState, useCallback, useRef } from 'react';
import { windows } from '../data/windows';

export function useWindowContent() {
  const [loadingContent, setLoadingContent] = useState<Set<string>>(new Set());

  // Use refs to track state without causing re-renders in callback
  const contentCacheRef = useRef<Map<string, string>>(new Map());
  const loadingRef = useRef<Set<string>>(new Set());

  const loadWindowContent = useCallback(
    async (windowId: string): Promise<string | null> => {
      const config = windows.find((w) => w.id === windowId);
      if (!config) return null;

      // Check cache first
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
      setLoadingContent((prev) => new Set(prev).add(windowId));

      try {
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
        setLoadingContent((prev) => {
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
