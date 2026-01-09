
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { Typewriter } from '../DataDisplay';
import { GenieIdea } from '../../../types';

export interface GenieCardProps {
  idea: GenieIdea;
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const GenieCard: React.FC<GenieCardProps> = ({ idea, onClick, disabled, style, className = '' }) => {
  return (
    <BaseCard
      noPadding={false}
      onClick={onClick}
      style={style}
      className={`cursor-pointer group hover:ring-2 hover:ring-primary/50 dark:hover:ring-primary-dark/50 transition-all active:scale-[0.98] relative ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline/50 dark:border-outline-dark/50 flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-105">
          {idea.emoji}
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <h4 className="text-base font-bold text-content dark:text-content-dark google-sans group-hover:text-primary dark:group-hover:text-primary-dark transition-colors mb-1 truncate">{idea.title}</h4>
          <div className="text-sm text-content-secondary dark:text-content-secondary-dark line-clamp-2 leading-relaxed min-h-[1.5em]">
            <Typewriter text={idea.summary} speed={10} />
          </div>
        </div>
        <div className="self-center pl-2">
          <div className="p-2 rounded-full bg-surface-variant dark:bg-surface-variant-dark group-hover:bg-primary-container dark:group-hover:bg-primary-container-dark text-content-tertiary dark:text-content-tertiary-dark group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export const GenieSkeleton = () => (
  <BaseCard className="animate-pulse border-outline/50 dark:border-outline-dark/50">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-variant dark:bg-surface-variant-dark rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 py-1 space-y-2">
        <div className="h-4 bg-surface-variant dark:bg-surface-variant-dark rounded w-1/3" />
        <div className="h-3 bg-surface-variant/50 dark:bg-surface-variant-dark/50 rounded w-3/4" />
      </div>
    </div>
  </BaseCard>
);
