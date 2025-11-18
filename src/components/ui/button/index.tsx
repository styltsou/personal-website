/**
 * Button UI Component
 * Composable button component with retro 90s styling
 *
 * Usage:
 * - Text only: <Button>Click me</Button>
 * - Icon only: <Button>↺</Button> (automatically square)
 * - Text + Icon: <Button><Button.Icon>↺</Button.Icon> Rotate</Button>
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

function Button({
  variant = 'default',
  size = 'medium',
  className,
  children,
  ...props
}: ButtonProps) {
  // Check if button is icon-only
  const childrenArray = React.Children.toArray(children);
  const hasOnlyIcon =
    childrenArray.length === 1 &&
    ((React.isValidElement(childrenArray[0]) &&
      childrenArray[0].type === ButtonIcon) ||
      (typeof childrenArray[0] === 'string' &&
        childrenArray[0].trim().length <= 2));

  return (
    <button
      className={cn(
        styles.button,
        variant === 'inset' && styles.variantInset,
        hasOnlyIcon && styles.iconOnly,
        size !== 'medium' &&
          styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ButtonIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn(styles.icon, className)}>{children}</span>;
}

Button.Icon = ButtonIcon;

export default Button;
