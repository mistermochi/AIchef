
import React from 'react';
import { TrendingUp } from 'lucide-react';
import { BaseCard } from './BaseCard';

export interface InsightCardProps {
  title: string;
  description?: string;
  value?: React.ReactNode;
  trend?: string;
  action?: React.ReactNode;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, description, value, trend, action, className = '' }) => {
  return (
    <BaseCard className={className} noPadding>
      <div className="p-4 md:p-6 flex flex-row gap-4 items-start">
         <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
               <div className="space-y-1">
                  <div className="text-sm font-bold text-content-tertiary dark:text-content-tertiary-dark uppercase tracking-wider">{title}</div>
                  {value && <div className="text-2xl font-bold text-content dark:text-content-dark google-sans">{value}</div>}
               </div>
               {action}
            </div>
            {description && <div className="text-sm text-content-secondary dark:text-content-secondary-dark leading-relaxed">{description}</div>}
            {trend && <div className="flex items-center gap-1 mt-2 text-xs font-bold text-success"><TrendingUp className="w-3 h-3" /> {trend}</div>}
         </div>
      </div>
    </BaseCard>
  );
};
