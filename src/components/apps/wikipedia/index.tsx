/**
 * Wikipedia Window Component
 * Simple iframe to Wikipedia
 */

export { WikipediaIcon } from './icon';

import { useState } from 'react';
import Loading from '@/components/ui/loading';
import styles from './styles.module.scss';

export default function WikipediaWindow() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loading}>
          <Loading />
        </div>
      )}
      <iframe
        src="https://www.wikipedia.org"
        className={styles.iframe}
        title="Wikipedia"
        allow="fullscreen"
        onLoad={handleLoad}
      />
    </div>
  );
}
