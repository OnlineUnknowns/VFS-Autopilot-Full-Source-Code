import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: 'searching' | 'found' | 'failed' | 'pending';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, status = 'pending', children, ...props }, ref) => {
    // Base badge layout styles
    const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200';

    // Status variant mappings
    const statuses = {
      searching: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40 animate-pulse-subtle shadow-sm shadow-blue-500/5',
      found: 'bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-950/30 dark:text-primary-500 dark:border-primary-900/40 shadow-md shadow-primary-500/10 ring-1 ring-primary-500/10',
      failed: 'bg-danger-50 text-danger-700 border-danger-100 dark:bg-danger-950/30 dark:text-danger-500 dark:border-danger-900/40 shadow-sm shadow-danger-500/5',
      pending: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40 shadow-sm shadow-amber-500/5',
    };

    // Prepend dot indicator or icon placeholder if appropriate
    const dotColors = {
      searching: 'bg-blue-500',
      found: 'bg-primary-500 shadow-sm shadow-primary-500',
      failed: 'bg-danger-500',
      pending: 'bg-amber-500',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, statuses[status], className)}
        {...props}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[status])} />
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
