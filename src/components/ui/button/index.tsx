/**
 * Button UI Component
 * Reusable button component with retro 90s styling
 */

import React from 'react';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'inset';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export default function Button({
  variant = 'default',
  size = 'medium',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        styles.button,
        variant === 'inset' && styles.variantInset,
        size !== 'medium' && styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

