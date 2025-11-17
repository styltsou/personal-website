/**
 * Hook for caching images to prevent reloading
 * Similar to content window caching, but for images
 */

import { useRef, useCallback } from 'react';

// Cache of image URLs to blob/data URLs
const imageCache = new Map<string, string>();

/**
 * Convert an image URL to a blob URL for caching
 */
async function imageToBlobUrl(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to cache image:', error);
    return imageUrl; // Fallback to original URL
  }
}

/**
 * Hook for caching and retrieving images
 */
export function useImageCache() {
  const loadingRef = useRef<Set<string>>(new Set());

  /**
   * Get cached image URL or return original if not cached
   */
  const getCachedImageUrl = useCallback((imageUrl: string): string => {
    return imageCache.get(imageUrl) || imageUrl;
  }, []);

  /**
   * Cache an image URL
   * Returns the cached URL (blob URL) or original URL if caching fails
   */
  const cacheImage = useCallback(
    async (imageUrl: string): Promise<string> => {
      // Already cached
      if (imageCache.has(imageUrl)) {
        return imageCache.get(imageUrl)!;
      }

      // Already loading
      if (loadingRef.current.has(imageUrl)) {
        return imageUrl;
      }

      // Mark as loading
      loadingRef.current.add(imageUrl);

      try {
        const blobUrl = await imageToBlobUrl(imageUrl);
        imageCache.set(imageUrl, blobUrl);
        return blobUrl;
      } catch (error) {
        console.error('Failed to cache image:', error);
        return imageUrl;
      } finally {
        loadingRef.current.delete(imageUrl);
      }
    },
    []
  );

  /**
   * Preload and cache an image
   */
  const preloadImage = useCallback(
    (imageUrl: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
          try {
            await cacheImage(imageUrl);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = reject;
        img.src = imageUrl;
      });
    },
    [cacheImage]
  );

  return {
    getCachedImageUrl,
    cacheImage,
    preloadImage,
  };
}

