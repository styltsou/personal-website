/**
 * Conditional class name utility
 * Filters out falsy values and joins class names
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
) {
  return classes.filter(Boolean).join(' ');
}

