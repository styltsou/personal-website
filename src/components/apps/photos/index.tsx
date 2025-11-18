/**
 * Photos Window Component
 * Image viewer that can display:
 * - Single image (when opened from a file via filePath prop)
 * - Gallery mode (when opened as an app, can display multiple images)
 */

import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import Button from '@/components/ui/button';

export { PhotosIcon, ImageFileIcon } from './icon';

export interface PhotosProps {
  filePath?: string; // When opened from a file, this contains the file path
  imagePath?: string; // Legacy support - when opened as app with imagePath
  images?: string[]; // Gallery mode - array of image paths
}

export default function PhotosWindow({
  filePath,
  imagePath,
  images,
}: PhotosProps) {
  // Determine which image(s) to display
  // Priority: filePath (from file) > imagePath (legacy) > images (gallery)
  const imageToDisplay = filePath || imagePath;
  const galleryImages = images || (imageToDisplay ? [imageToDisplay] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentImage = galleryImages[currentIndex];

  // Reset rotation when image changes
  useEffect(() => {
    setRotation(0);
  }, [currentImage]);

  // Calculate scale for rotated image to prevent overflow
  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    const updateScale = () => {
      if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0)
        return;

      const normalizedRotation = ((rotation % 360) + 360) % 360;
      const wrapper = img.parentElement;
      if (!wrapper) return;

      // For 0, 180 degrees - just rotate, no scaling
      if (normalizedRotation === 0 || normalizedRotation === 180) {
        wrapper.style.transform = `rotate(${rotation}deg)`;
        return;
      }

      // Only scale for 90/270 degrees
      if (normalizedRotation !== 90 && normalizedRotation !== 270) {
        wrapper.style.transform = `rotate(${rotation}deg)`;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) return;

      // Account for padding (1.6rem = 16px on each side = 32px total)
      const containerWidth = containerRect.width - 32;
      const containerHeight = containerRect.height - 32;
      if (containerWidth <= 0 || containerHeight <= 0) return;

      // When rotated 90/270, dimensions swap
      // Image natural size: W x H
      // After rotation bounding box: H x W
      // Need to fit H in containerWidth and W in containerHeight
      const scale = Math.min(
        containerWidth / img.naturalHeight,
        containerHeight / img.naturalWidth,
        1
      );

      // Apply rotation and scale to the wrapper
      wrapper.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    };

    if (img.complete) {
      updateScale();
    } else {
      img.onload = updateScale;
    }

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);

    return () => {
      img.onload = null;
      resizeObserver.disconnect();
    };
  }, [rotation, currentImage]);

  const handleRotateCounterclockwise = () => {
    setRotation(prev => (prev - 90) % 360);
  };

  const handleRotateClockwise = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // If no images, show empty state
  if (galleryImages.length === 0) {
    return (
      <div className={styles.photosContainer}>
        <div className={styles.photosContent}>
          <div className={styles.photosError}>No images to display</div>
        </div>
      </div>
    );
  }

  // Single image mode (opened from file or with single imagePath)
  if (galleryImages.length === 1) {
    return (
      <div ref={containerRef} className={styles.photosContainer}>
        <div className={styles.photosContent}>
          <div className={styles.imageWrapper}>
            <img
              ref={imageRef}
              src={currentImage}
              alt="Photo"
              className={styles.photosImage}
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = styles.photosError;
                errorDiv.textContent = `Failed to load image: ${currentImage}`;
                target.parentElement?.appendChild(errorDiv);
                console.error('Failed to load image:', currentImage);
              }}
            />
          </div>
        </div>
        <div className={styles.rotationControls}>
          <Button
            onClick={handleRotateCounterclockwise}
            aria-label="Rotate counterclockwise"
          >
            ↺
          </Button>
          <Button onClick={handleRotateClockwise} aria-label="Rotate clockwise">
            ↻
          </Button>
        </div>
      </div>
    );
  }

  // Gallery mode (multiple images)
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div ref={containerRef} className={styles.photosContainer}>
      <div className={styles.photosContent}>
        <img
          ref={imageRef}
          src={currentImage}
          alt={`Photo ${currentIndex + 1} of ${galleryImages.length}`}
          className={styles.photosImage}
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className = styles.photosError;
            errorDiv.textContent = `Failed to load image: ${currentImage}`;
            target.parentElement?.appendChild(errorDiv);
            console.error('Failed to load image:', currentImage);
          }}
        />
        {/* Gallery navigation */}
        <div className={styles.galleryControls}>
          <button
            className={styles.galleryButton}
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            ←
          </button>
          <span className={styles.galleryCounter}>
            {currentIndex + 1} / {galleryImages.length}
          </span>
          <button
            className={styles.galleryButton}
            onClick={handleNext}
            aria-label="Next image"
          >
            →
          </button>
        </div>
      </div>
      <div className={styles.rotationControls}>
        <Button
          onClick={handleRotateCounterclockwise}
          aria-label="Rotate counterclockwise"
          size="large"
        >
          ↺
        </Button>
        <Button
          onClick={handleRotateClockwise}
          aria-label="Rotate clockwise"
          size="large"
        >
          ↻
        </Button>
      </div>
    </div>
  );
}
