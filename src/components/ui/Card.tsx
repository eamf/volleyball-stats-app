import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={clsx(
          'bg-white rounded-lg border border-gray-200 shadow-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';