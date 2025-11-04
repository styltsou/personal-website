/**
 * Wikipedia Window Component
 * Simple iframe to Wikipedia
 */

import styles from './styles.module.scss';

export default function WikipediaWindow() {
  return (
    <div className={styles.container}>
      <iframe
        src="https://www.wikipedia.org"
        className={styles.iframe}
        title="Wikipedia"
        allow="fullscreen"
      />
    </div>
  );
}
