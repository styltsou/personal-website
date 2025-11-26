/**
 * Chevron Icon Component
 * A simple chevron icon for the terminal prompt
 */

interface ChevronIconProps {
  className?: string;
}

export function ChevronIcon({ className }: ChevronIconProps) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.39-1.02-.39-1.41.01z" />
    </svg>
  );
}

