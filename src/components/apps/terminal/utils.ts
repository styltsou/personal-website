/**
 * Terminal Utility Functions
 */

/**
 * Detect browser from user agent
 */
export function detectBrowser(): string {
  if (typeof window === 'undefined' || !window.navigator) {
    return 'website'; // Fallback for SSR
  }

  // Check for Brave first (it has navigator.brave object)
  // @ts-ignore - navigator.brave is a Brave-specific property
  if (
    window.navigator.brave &&
    typeof window.navigator.brave.isBrave === 'function'
  ) {
    return 'brave';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();

  // Edge (check before Chrome since Edge Chromium includes Chrome in UA)
  if (userAgent.includes('edg/') || userAgent.includes('edgios/')) {
    return 'edge';
  }

  // Opera (check before Chrome since Opera also includes Chrome in UA)
  if (userAgent.includes('opr/') || userAgent.includes('opera/')) {
    return 'opera';
  }

  // Chrome (after checking for Edge and Opera)
  if (userAgent.includes('chrome/')) {
    return 'chrome';
  }

  // Firefox
  if (userAgent.includes('firefox/')) {
    return 'firefox';
  }

  // Safari (check last since it also includes Chrome in UA on iOS)
  if (userAgent.includes('safari/')) {
    return 'safari';
  }

  // Fallback
  return 'website';
}

/**
 * Find common prefix from an array of strings
 */
export function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (
      !strings[i].toLowerCase().startsWith(prefix.toLowerCase()) &&
      prefix.length > 0
    ) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}

import { VALID_COMMANDS } from './constants';

/**
 * Check if a command is valid
 */
export function isValidCommand(command: string): boolean {
  const trimmedCommand = command.trim();
  if (!trimmedCommand) return false;
  const [cmd] = trimmedCommand.split(' ');
  return VALID_COMMANDS.includes(cmd.toLowerCase() as any);
}

