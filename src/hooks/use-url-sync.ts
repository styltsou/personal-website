/**
 * Hook for synchronizing window state with browser URL
 * Works with Zustand store
 */

import { useEffect, useCallback, useRef } from 'react';
import { apps } from '@/app-config';
import { useStore } from '../store';

export function useURLSync() {
  // Properly select from store with individual selectors
  const windows = useStore((state) => state.windows);
  const openWindow = useStore((state) => state.openWindow);
  const closeAllWindows = useStore((state) => state.closeAllWindows);

  // Track if this is the initial mount to only auto-open on first load
  const isInitialMount = useRef(true);

  // Find window by path
  const findWindowByPath = useCallback((path: string) => {
    return apps.find((w) => w.path === path);
  }, []);

  // Check URL on initial mount and open window if needed
  // Only auto-open on initial mount, not when windows are closed programmatically
  useEffect(() => {
    if (isInitialMount.current && windows.length === 0) {
      const currentPath = window.location.pathname;
      // Only auto-open if we're on a window path (not home page)
      if (currentPath !== '/') {
        const matchedWindow = findWindowByPath(currentPath);
        if (matchedWindow) {
          openWindow(matchedWindow.id);
        }
      }
      isInitialMount.current = false;
    } else if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [windows.length, findWindowByPath, openWindow]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.windowId) {
        openWindow(event.state.windowId);
      } else if (!event.state) {
        // If no state, check current path
        const currentPath = window.location.pathname;
        const matchedWindow = findWindowByPath(currentPath);
        if (matchedWindow) {
          openWindow(matchedWindow.id);
        } else {
          // Close all windows if on home page
          closeAllWindows();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [findWindowByPath, openWindow, closeAllWindows]);

  // Update URL when window changes
  const updateURL = useCallback((windowId: string | null) => {
    if (windowId) {
      const config = apps.find((w) => w.id === windowId);
      if (config && config.path) {
        history.pushState({ windowId }, '', config.path);
      }
    } else {
      history.pushState({}, '', '/');
    }
  }, []);

  return { updateURL };
}
