import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'brand' | 'gold' | 'link';
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
    'inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

  const variants = {
    default:
      'bg-[#09090B] text-white hover:bg-[#27272A] active:scale-[0.98] shadow-clean-xs',
    gold:
      'bg-[#09090B] text-white hover:bg-[#27272A] active:scale-[0.98] shadow-clean-xs',
    brand:
      'bg-[#09090B] text-white hover:bg-[#27272A] active:scale-[0.98] shadow-clean-xs',
    secondary:
      'bg-[#F4F4F5] text-[#09090B] hover:bg-[#E4E4E7] active:scale-[0.98]',
    outline:
      'border border-[#E4E4E7] bg-white text-[#09090B] hover:bg-[#F9FAFB] hover:border-[#D4D4D8] active:scale-[0.98] shadow-clean-xs',
    ghost:
      'text-[#52525B] hover:bg-neutral-100 hover:text-[#09090B] active:scale-[0.98]',
    destructive:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-clean-xs active:scale-[0.98]',
    link:
      'text-[#09090B] underline-offset-4 hover:underline p-0 h-auto rounded-none font-normal',
  };

  const sizes = {
    default: 'h-9 px-4 py-2 text-xs',
    sm: 'h-8 px-3.5 py-1 text-xs',
    xs: 'h-7 px-2.5 py-0.5 text-[11px]',
    lg: 'h-11 px-6 py-2.5 text-sm',
    icon: 'h-9 w-9 p-0',
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
      <button ref={ref} className={combinedClassName} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
