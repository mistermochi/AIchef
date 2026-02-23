
import React from 'react';
import { BaseCardProps } from './BaseCard';

export interface ProcessCardProps extends BaseCardProps {
  type: 'prep' | 'cook' | 'wait';
  title: string;
  subtitle?: string;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({ type, title, subtitle, children, className = '' }) => {
  const styles = {
    prep: "bg-primary-container dark:bg-primary-container-dark border-primary/20 dark:border-primary-dark/30 text-primary dark:text-primary-dark",
    cook: "bg-warning-container dark:bg-warning-container-dark border-warning/20 dark:border-warning/30 text-warning-on-container dark:text-warning-on-container-dark",
    wait: "bg-accent-container dark:bg-accent-container-dark border-accent/20 dark:border-accent/30 text-accent-on-container dark:text-accent-on-container-dark",
  };

  return (
    <div className={`bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-2xl shadow-sm transition-colors overflow-hidden flex flex-col ${className}`}>
      <div className={`h-10 px-4 border-b flex items-center justify-between shrink-0 transition-colors ${styles[type]}`}>
         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider truncate">
            <span>{title}</span>
         </div>
         {subtitle && <span className="text-xs font-mono font-medium opacity-80">{subtitle}</span>}
      </div>
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {children}
      </div>
    </div>
  );
};
