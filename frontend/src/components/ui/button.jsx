import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

const buttonVariants = {
  variant: {
    default:
      'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-soft',
    destructive:
      'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    outline:
      'border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-500',
    secondary:
      'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary-500',
    ghost: 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900',
    link: 'text-primary-600 underline-offset-4 hover:underline',
  },
  size: {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-lg px-3',
    lg: 'h-11 rounded-xl px-8',
    icon: 'h-10 w-10',
  },
};

const Button = React.forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
