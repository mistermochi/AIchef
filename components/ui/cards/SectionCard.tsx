
import React from 'react';
import { BaseCard, BaseCardProps } from './BaseCard';

export interface SectionCardProps extends Omit<BaseCardProps, 'title'> {
  title: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon, action, footer, children, className = '', noPadding = false, ...props }) => {
  return (
    <div className={`bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-2xl shadow-sm transition-colors overflow-hidden flex flex-col ${className}`} {...props}>
      <div className="h-10 px-4 border-b border-outline/30 dark:border-outline-dark/30 flex items-center justify-between shrink-0 bg-surface-variant/30 dark:bg-surface-variant-dark/30">
         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider truncate text-content-secondary dark:text-content-secondary-dark">
            {icon && React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-3.5 h-3.5" })}
            <span>{title}</span>
         </div>
         <div className="flex items-center gap-2">{action}</div>
      </div>
      <div className={`flex-1 flex flex-col min-h-0 w-full ${noPadding ? '' : 'p-4 md:p-6'}`}>
        {children}
      </div>
      {footer && <div className="mt-auto pt-3 border-t border-outline/30 dark:border-outline-dark/30 p-4 bg-surface-variant/10">{footer}</div>}
    </div>
  );
};
