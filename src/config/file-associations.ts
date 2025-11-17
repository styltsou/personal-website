/**
 * File Type Associations
 * Maps file extensions to app IDs that can open them
 */

export const fileAssociations: Record<string, string> = {
  // Image files
  '.jpg': 'photos',
  '.jpeg': 'photos',
  '.png': 'photos',
  '.gif': 'photos',
  '.webp': 'photos',
  '.svg': 'photos',
  '.bmp': 'photos',
  
  // Text files
  '.txt': 'notepad',
  '.md': 'notepad',
  '.log': 'notepad',
};

/**
 * Get the app ID associated with a file extension
 */
export function getAppForFile(filePath: string): string | null {
  const extension = filePath
    .toLowerCase()
    .substring(filePath.lastIndexOf('.'));
  
  return fileAssociations[extension] || null;
}

/**
 * Get file extension from file path
 */
export function getFileExtension(filePath: string): string {
  return filePath
    .toLowerCase()
    .substring(filePath.lastIndexOf('.'));
}

