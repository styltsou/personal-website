/**
 * Input UI Component
 * Reusable input component with retro 90s styling
 */

import React from 'react';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Additional props can be added here if needed
}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(styles.input, className)}
      {...props}
    />
  );
}

