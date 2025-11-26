/**
 * Terminal Types
 */

export interface DirectoryItem {
  name: string;
  type: 'directory' | 'app' | 'file';
}

export interface TerminalLine {
  type: 'output' | 'error' | 'command';
  content: string;
  timestamp?: Date;
  dataType?: 'directory' | 'info'; // For directory listings or info messages
  directory?: string; // Directory at the time the command was executed (for command lines)
  directoryItems?: DirectoryItem[]; // Metadata about items in directory listings
}

