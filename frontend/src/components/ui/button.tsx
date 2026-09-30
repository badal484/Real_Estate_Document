import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'brand' | 'link';
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
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

  const variants = {
    default: 'bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 active:scale-[0.99]',
    brand: 'bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 active:scale-[0.99]',
    secondary: 'bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80 active:scale-[0.99]',
    outline:
      'border border-border/70 bg-background shadow-2xs hover:bg-muted hover:text-foreground text-foreground active:scale-[0.99]',
    ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground active:scale-[0.99]',
    destructive: 'bg-destructive text-destructive-foreground shadow-2xs hover:bg-destructive/90 active:scale-[0.99]',
    link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
  };

  const sizes = {
    default: 'h-8 px-3.5 py-1.5 text-xs',
    sm: 'h-7 px-2.5 py-1 text-xs',
    xs: 'h-6 px-2 py-0.5 text-[11px]',
    lg: 'h-9 px-4 py-2 text-sm',
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
