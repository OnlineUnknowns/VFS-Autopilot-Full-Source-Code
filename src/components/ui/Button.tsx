import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles: interactive styling, accessibility outlines, layout controls
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';
    
    // Variant maps using CSS custom variable mappings
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-canvas-base border border-transparent shadow-sm shadow-primary-500/10',
      danger: 'bg-danger-50 text-danger-700 hover:bg-danger-100 border border-danger-100 dark:bg-danger-500/10 dark:text-danger-500 dark:hover:bg-danger-500/20 dark:border-danger-500/20 focus-visible:ring-danger-500',
      secondary: 'bg-canvas-secondary text-text-primary hover:bg-canvas-tertiary border border-border-default hover:border-text-muted focus-visible:ring-primary-500 dark:focus-visible:ring-offset-canvas-base',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-canvas-secondary focus-visible:ring-primary-500 border border-transparent',
    };

    // Size mappings
    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
    };

    const isBtnDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isBtnDisabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ms-1 me-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!isLoading && leftIcon && (
          <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        
        <span className="truncate">{children}</span>
        
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
