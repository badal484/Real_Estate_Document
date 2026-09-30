import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger' | 'accent' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  asChild?: boolean;
}

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className = '',
}: {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
} = {}) {
  const baseStyles =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

  const variants = {
    default: 'bg-primary text-white shadow-2xs hover:bg-primary-hover active:scale-[0.99]',
    accent: 'bg-accent text-white shadow-2xs hover:bg-accent/90 active:scale-[0.99]',
    secondary: 'bg-surface text-primary-text border border-border shadow-2xs hover:bg-secondary active:scale-[0.99]',
    outline: 'border border-border bg-transparent shadow-2xs hover:bg-secondary hover:text-primary-text text-secondary-text active:scale-[0.99]',
    ghost: 'hover:bg-secondary text-secondary-text hover:text-primary-text active:scale-[0.99]',
    destructive: 'bg-danger text-white shadow-2xs hover:bg-danger/90 active:scale-[0.99]',
    danger: 'bg-danger text-white shadow-2xs hover:bg-danger/90 active:scale-[0.99]',
    link: 'text-primary underline-offset-4 hover:underline p-0 h-auto font-normal',
  };

  const sizes = {
    default: 'h-8.5 px-3.5 py-1.5 text-xs',
    sm: 'h-7.5 px-2.5 py-1 text-xs',
    xs: 'h-6.5 px-2 py-0.5 text-[11px]',
    lg: 'h-9.5 px-4 py-2 text-sm',
    icon: 'h-8 w-8 p-0',
  };

  return cn(baseStyles, variants[variant], sizes[size], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, disabled, children, ...props }, ref) => {
    const combinedClassName = buttonVariants({ variant, size, className });

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>, {
        className: cn(combinedClassName, (children.props as { className?: string })?.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
