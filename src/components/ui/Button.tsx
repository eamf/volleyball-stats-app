// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500': variant === 'primary',
            'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500': variant === 'secondary',
            'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500': variant === 'outline',
            'hover:bg-gray-100 text-gray-700 focus:ring-gray-500': variant === 'ghost',
            'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm rounded-md': size === 'sm',
            'px-4 py-2 text-sm rounded-md': size === 'md',
            'px-6 py-3 text-base rounded-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

