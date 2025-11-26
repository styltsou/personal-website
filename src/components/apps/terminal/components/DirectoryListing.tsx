/**
 * Directory Listing Component
 * Renders directory listings with directories in accent color and files/apps in neutral color
 */

import type { DirectoryItem } from '../types';
import styles from '../styles.module.scss';

interface DirectoryListingProps {
  content: string;
  currentDirectory: string;
  directoryItems?: DirectoryItem[]; // Metadata about items (from config)
}

// Known directories for each location (fallback for backwards compatibility)
const ROOT_DIRECTORIES = ['about', 'contact', 'desktop', 'projects'];

export function DirectoryListing({
  content,
  currentDirectory,
  directoryItems,
}: DirectoryListingProps) {
  if (!content || content === 'No items found') {
    return <span>{content}</span>;
  }

  // If we have metadata, use it directly to render items properly
  // This handles multi-word names like "Snake Game" correctly
  if (directoryItems && directoryItems.length > 0) {
    return (
      <>
        {directoryItems.map((item, index) => {
          // Determine which style class to use
          let className = styles.fileItem; // Default to file (neutral color)
          if (item.type === 'directory') {
            className = styles.directoryItem; // Accent color for directories
          } else if (item.type === 'app') {
            className = styles.appItem; // Accent color for apps
          }
          // item.type === 'file' uses default fileItem (neutral color)

          return (
            <span key={index}>
              <span className={className}>{item.name}</span>
              {index < directoryItems.length - 1 && '  '}
            </span>
          );
        })}
      </>
    );
  }

  // Fallback: parse content string if no metadata available
  // Split content by spaces (items are separated by '  ')
  const items = content.split(/\s+/).filter(Boolean);

  // Determine which items are directories (for backwards compatibility)
  const isDirectory = (item: string): boolean => {
    // Fallback to old logic for backwards compatibility
    if (currentDirectory === '~') {
      return ROOT_DIRECTORIES.includes(item.toLowerCase());
    }
    // For desktop (~/desktop), items are files/apps (not directories)
    if (currentDirectory === '~/desktop' || currentDirectory === 'desktop') {
      return false; // All desktop items are files/apps
    }
    return false;
  };

  return (
    <>
      {items.map((item, index) => {
        const isDir = isDirectory(item);

        // Determine which style class to use
        let className = styles.fileItem; // Default to file (neutral color)
        if (isDir) {
          className = styles.directoryItem; // Fallback for directories
        }

        return (
          <span key={index}>
            <span className={className}>{item}</span>
            {index < items.length - 1 && '  '}
          </span>
        );
      })}
    </>
  );
}
