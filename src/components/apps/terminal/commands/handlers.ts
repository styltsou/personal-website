/**
 * Command Handlers
 */

import type { TerminalLine, DirectoryItem } from '../types';
import { getDesktopIcons } from '@/components/desktop-icons';
import { apps } from '@/app-config';

export interface CommandContext {
  currentDirectory: string;
  setCurrentDirectory: (dir: string) => void;
  setLines: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  closeWindow: (windowId: string) => void;
}

export function executeCommand(
  command: string,
  context: CommandContext
): void {
  const trimmedCommand = command.trim();
  if (!trimmedCommand) return;

  const [cmd, ...args] = trimmedCommand.split(' ');

  switch (cmd.toLowerCase()) {
    case 'help':
      context.setLines(prev => [
        ...prev,
        { type: 'output', content: 'Available commands:' },
        { type: 'output', content: '  help - Show this help message' },
        { type: 'output', content: '  clear - Clear the terminal' },
        { type: 'output', content: '  echo <text> - Echo text back' },
        { type: 'output', content: '  exit - Close the terminal window' },
        { type: 'output', content: '  pwd - Print working directory' },
        { type: 'output', content: '  ls - List directory contents' },
        { type: 'output', content: '  cd <directory> - Change directory' },
      ]);
      break;

    case 'clear':
      context.setLines([]);
      break;

    case 'echo':
      context.setLines(prev => [
        ...prev,
        { type: 'output', content: args.join(' ') || '' },
      ]);
      break;

    case 'exit':
      context.closeWindow('terminal');
      break;

    case 'pwd':
      context.setLines(prev => [
        ...prev,
        { type: 'output', content: context.currentDirectory },
      ]);
      break;

    case 'cd':
      handleCdCommand(args, context);
      break;

    case 'ls':
      handleLsCommand(context);
      break;

    default:
      context.setLines(prev => [
        ...prev,
        {
          type: 'error',
          content: `Command not found: ${cmd}. Type "help" for available commands.`,
        },
      ]);
  }
}

function handleCdCommand(args: string[], context: CommandContext): void {
  const targetDir = args[0] || '~';

  if (targetDir === '~' || targetDir === '') {
    context.setCurrentDirectory('~');
    return;
  }

  // Handle relative paths
  if (targetDir === '..') {
    if (context.currentDirectory === '~/desktop') {
      context.setCurrentDirectory('~');
    } else {
      context.setCurrentDirectory('~');
    }
    return;
  }

  // Handle ~/desktop or desktop
  if (targetDir === 'desktop' || targetDir === '~/desktop') {
    context.setCurrentDirectory('~/desktop');
    return;
  }

  // Check if directory exists in root
  const validRootDirs = ['about', 'contact', 'projects', 'desktop'];
  if (validRootDirs.includes(targetDir)) {
    if (targetDir === 'desktop') {
      context.setCurrentDirectory('~/desktop');
    } else {
      // For other root dirs, we could navigate to them, but for now just show error
      // since they're not really directories
      context.setLines(prev => [
        ...prev,
        {
          type: 'error',
          content: `cd: ${targetDir}: Not a directory`,
        },
      ]);
    }
  } else if (targetDir.startsWith('~/')) {
    // Handle absolute paths starting with ~/
    const dirName = targetDir.substring(2);
    if (dirName === 'desktop') {
      context.setCurrentDirectory('~/desktop');
    } else {
      context.setLines(prev => [
        ...prev,
        {
          type: 'error',
          content: `cd: ${targetDir}: No such file or directory`,
        },
      ]);
    }
  } else {
    context.setLines(prev => [
      ...prev,
      {
        type: 'error',
        content: `cd: ${targetDir}: No such file or directory`,
      },
    ]);
  }
}

/**
 * Get root directories from app config
 * Returns apps that should appear in root directory listing
 */
function getRootDirectories(): DirectoryItem[] {
  // For now, only show Desktop directory in root
  return [
    {
      name: 'desktop',
      type: 'directory' as const,
    },
  ];
}

/**
 * Get desktop items from app config
 * Returns both apps and files that have desktop icons
 */
function getDesktopItems(): DirectoryItem[] {
  const icons = getDesktopIcons();
  
  return icons.map(icon => {
    // Find the app config for this icon
    const appConfig = apps.find(app => app.id === icon.id);
    
    if (appConfig?.type === 'file') {
      return {
        name: icon.label,
        type: 'file' as const,
      };
    } else {
      return {
        name: icon.label,
        type: 'app' as const,
      };
    }
  });
}

function handleLsCommand(context: CommandContext): void {
  let lsContent = '';
  let directoryItems: DirectoryItem[] = [];
  
  if (
    context.currentDirectory === '~/desktop' ||
    context.currentDirectory === 'desktop'
  ) {
    // List desktop icons - get from config
    directoryItems = getDesktopItems();
    const desktopItemNames = directoryItems.map(item => item.name).join('  ');
    lsContent = desktopItemNames || 'No items found';
  } else if (context.currentDirectory === '~') {
    // Root directory - get from config
    directoryItems = getRootDirectories();
    const rootDirNames = directoryItems.map(item => item.name).join('  ');
    lsContent = rootDirNames || 'No items found';
  } else {
    // Other directories
    lsContent = 'No items found';
  }
  
  context.setLines(prev => [
    ...prev,
    { 
      type: 'output', 
      content: lsContent, 
      dataType: 'directory',
      directory: context.currentDirectory, // Store directory context for proper rendering
      directoryItems: directoryItems.length > 0 ? directoryItems : undefined,
    },
  ]);
}

