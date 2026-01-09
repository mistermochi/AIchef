
import React from 'react';

export interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const BaseCard: React.FC<BaseCardProps> = ({ children, className = '', noPadding, ...props }) => {
  return (
    <div 
      className={`bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-2xl shadow-sm transition-colors overflow-hidden flex flex-col ${className}`} 
      {...props}
    >
      <div className={`flex-1 flex flex-col min-h-0 w-full ${noPadding ? '' : 'p-4 md:p-6'}`}>
        {children}
      </div>
    </div>
  );
};
