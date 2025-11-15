/**
 * Loading Screen Component
 * Retro-style loading screen with "styltsou" branding
 * Shows while desktop is initializing
 */

import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import styles from './styles.module.scss';

export default function LoadingScreen() {
  const hasLoadedFromPersistence = useStore(
    (state) => state.hasLoadedFromPersistence
  );
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (hasLoadedFromPersistence) {
      // Small delay before hiding to ensure smooth transition
      const timer = setTimeout(() => {
        setShow(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [hasLoadedFromPersistence]);

  if (!show) return null;

  return (
    <div className={styles.loadingScreen}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <span className={styles.logoText}>styltsou</span>
          <div className={styles.cursor}>_</div>
        </div>
      </div>
    </div>
  );
}

