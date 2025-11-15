/**
 * Loading Indicator Component
 * Reusable loading indicator with animated dots
 * Used for content windows, Wikipedia app, and other loading states
 */

import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export interface LoadingProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
}

export default function Loading({ className }: LoadingProps) {
  return (
    <div className={cn(styles.loadingContent, className)}>
      <p className={styles.loadingText}>
        Loading
        <span className={styles.loadingDots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );
}

