/**
 * Hook to detect and track browser
 */

import { useState, useEffect } from 'react';
import { detectBrowser } from '../utils';

export function useBrowserDetection(): string {
  const [hostname, setHostname] = useState<string>('website');

  useEffect(() => {
    const browser = detectBrowser();
    setHostname(browser);
  }, []);

  return hostname;
}

