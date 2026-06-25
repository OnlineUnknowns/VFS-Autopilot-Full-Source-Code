import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col space-y-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center rounded-lg">
          {leftIcon && (
            <div className="absolute start-3 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              'w-full min-w-0 bg-canvas-secondary border rounded-lg text-sm text-text-primary px-3.5 py-2.5 transition-all duration-200 ease-out placeholder:text-text-muted focus:outline-none focus:bg-canvas-base',
              // Dynamic padding when icons are present (logical layout properties)
              leftIcon ? 'ps-10' : 'ps-3.5',
              rightIcon ? 'pe-10' : 'pe-3.5',
              // Normal state border
              'border-border-default hover:border-text-muted/40 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0',
              // Error state border
              error && 'border-danger-500 hover:border-danger-600 focus:border-danger-500 focus:ring-danger-500/20',
              // Disabled state border
              props.disabled && 'bg-canvas-tertiary border-border-default text-text-muted opacity-60 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute end-3 flex items-center pointer-events-none text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-danger-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
