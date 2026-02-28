
import React from 'react';
import { Card } from '../card';
import { cn } from '@/shared/lib/utils';

export interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const BaseCard = React.forwardRef<HTMLDivElement, BaseCardProps>(
  ({ children, className, noPadding, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={className}
        {...props}
      >
        <div className={cn("flex-1 flex flex-col min-h-0 w-full", noPadding ? "" : "p-4 md:p-6")}>
          {children}
        </div>
      </Card>
    );
  }
);
BaseCard.displayName = "BaseCard";
