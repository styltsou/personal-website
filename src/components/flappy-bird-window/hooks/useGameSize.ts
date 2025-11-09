/**
 * Custom hook to manage game size based on container
 */

import { useState, useEffect } from 'react';
import type { RefObject } from 'react';
import type { GameSize } from '../types';

/**
 * Manages game size based on container dimensions
 */
export function useGameSize(
  containerRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>
): GameSize {
  const [gameSize, setGameSize] = useState<GameSize>({ width: 600, height: 400 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current || !canvasRef.current) return;

    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setGameSize({ width, height });

        // Set canvas size
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef, canvasRef]);

  return gameSize;
}

