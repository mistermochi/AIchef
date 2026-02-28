
import React from 'react';
import { BaseCardProps } from './BaseCard';

export interface ProcessCardProps extends BaseCardProps {
  type: 'prep' | 'cook' | 'wait';
  title: string;
  subtitle?: string;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({ type, title, subtitle, children, className = '' }) => {
  const styles = {
    prep: "bg-primary/10 border-primary/20 text-primary",
    cook: "bg-warning/10 border-warning/20 text-warning",
    wait: "bg-accent/10 border-accent/20 text-accent",
  };

  return (
    <div className={`bg-background border border-border rounded-2xl shadow-sm transition-colors overflow-hidden flex flex-col ${className}`}>
      <div className={`h-10 px-4 border-b flex items-center justify-between shrink-0 transition-colors ${styles[type]}`}>
         <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] truncate">
            <span>{title}</span>
         </div>
         {subtitle && <span className="text-[10px] font-mono font-medium opacity-80">{subtitle}</span>}
      </div>
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {children}
      </div>
    </div>
  );
};
