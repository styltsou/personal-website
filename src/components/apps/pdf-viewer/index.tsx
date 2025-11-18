/**
 * PDF Viewer Window Component
 * PDF viewer that can display PDF files opened via filePath prop
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import styles from './styles.module.scss';
import Button from '@/components/ui/button';
import Loading from '@/components/ui/loading';

export { PdfViewerIcon, PdfFileIcon } from './icon';

export interface PdfViewerProps {
  filePath?: string; // When opened from a file, this contains the file path
}

export default function PdfViewerWindow({ filePath }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [PdfComponents, setPdfComponents] = useState<{
    Document: any;
    Page: any;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load react-pdf only on client side to avoid SSR issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      // Dynamically import react-pdf and its CSS only on client
      Promise.all([
        import('react-pdf'),
        import('react-pdf/dist/esm/Page/AnnotationLayer.css'),
        import('react-pdf/dist/esm/Page/TextLayer.css'),
      ]).then(([pdfModule]) => {
        const { Document, Page, pdfjs } = pdfModule;
        // Set up PDF.js worker - use unpkg CDN (more reliable than cdnjs)
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        setPdfComponents({ Document, Page });
      }).catch((err) => {
        console.error('Failed to load react-pdf:', err);
        setError('Failed to load PDF viewer');
        setLoading(false);
      });
    }
  }, []);

  // Reset page when file changes
  useEffect(() => {
    setPageNumber(1);
    setZoom(1.0);
    setError(null);
    setLoading(true);
  }, [filePath]);

  // Calculate container dimensions for fitting PDF at 100% zoom
  useEffect(() => {
    if (!contentRef.current) return;

    const updateDimensions = () => {
      if (contentRef.current) {
        // Account for horizontal padding only (1.6rem = 16px on each side = 32px total for width)
        const availableWidth = contentRef.current.clientWidth - 32;
        // No vertical padding, so use full height
        const availableHeight = contentRef.current.clientHeight;
        setContainerWidth(availableWidth);
        setContainerHeight(availableHeight);
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(contentRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Failed to load PDF:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  const handlePrevious = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPageNumber(prev => (numPages ? Math.min(numPages, prev + 1) : prev));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  // If no file path, show empty state
  if (!filePath) {
    return (
      <div className={styles.pdfContainer}>
        <div className={styles.pdfContent}>
          <div className={styles.pdfError}>No PDF file to display</div>
        </div>
      </div>
    );
  }

  // Show loading state while react-pdf is being loaded
  if (!isClient || !PdfComponents) {
    return (
      <div className={styles.pdfContainer}>
        <Loading />
      </div>
    );
  }

  const { Document, Page } = PdfComponents;

  return (
    <div ref={containerRef} className={styles.pdfContainer}>
      <div ref={contentRef} className={styles.pdfContent}>
        {error ? (
          <div className={styles.pdfError}>{error}</div>
        ) : (
          <Document
            file={filePath}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<Loading />}
          >
            <div className={styles.pageWrapper}>
              <Page
                pageNumber={pageNumber}
                width={zoom === 1.0 && containerWidth ? containerWidth : undefined}
                height={zoom === 1.0 && containerHeight ? containerHeight : undefined}
                scale={zoom !== 1.0 ? zoom : undefined}
                className={styles.pdfPage}
              />
            </div>
          </Document>
        )}
      </div>
      {/* Top control bar */}
      {numPages && !error && (
        <div className={styles.controlBar}>
          <div className={styles.controlGroup}>
            <Button
              onClick={handlePrevious}
              aria-label="Previous page"
              disabled={pageNumber <= 1}
            >
              <Button.Icon>
                <ChevronLeft size={20} />
              </Button.Icon>
            </Button>
            <span className={styles.pageCounter}>
              {pageNumber} / {numPages}
            </span>
            <Button
              onClick={handleNext}
              aria-label="Next page"
              disabled={pageNumber >= numPages}
            >
              <Button.Icon>
                <ChevronRight size={20} />
              </Button.Icon>
            </Button>
          </div>
          <div className={styles.controlGroup}>
            <Button
              onClick={handleZoomOut}
              aria-label="Zoom out"
              disabled={zoom <= 0.5}
            >
              <Button.Icon>
                <ZoomOut size={20} />
              </Button.Icon>
            </Button>
            <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
            <Button
              onClick={handleZoomIn}
              aria-label="Zoom in"
              disabled={zoom >= 3.0}
            >
              <Button.Icon>
                <ZoomIn size={20} />
              </Button.Icon>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

