import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-8.5 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-primary-text placeholder:text-secondary-text/50 shadow-2xs transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
