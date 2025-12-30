
import React from 'react';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { Badge, Typewriter } from './DataDisplay';
import { GenieIdea } from '../../types';

// --- LEVEL 1: PRIMITIVES ---

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
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

// --- LEVEL 2: COMPOSABLE BLOCKS ---

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { onClick?: () => void }> = ({ children, className = '', onClick, style, ...props }) => (
  <div className={className} style={style} {...props}>
    <BaseCard noPadding className="group cursor-pointer hover:ring-2 hover:ring-primary/50 dark:hover:ring-primary-dark/50 transition-all active:scale-[0.98] h-full" onClick={onClick}>
       {children}
    </BaseCard>
  </div>
);

export const CardMedia: React.FC<{ src?: string | null; fallbackEmoji?: string; children?: React.ReactNode }> = ({ src, fallbackEmoji, children }) => (
  <div className="relative aspect-[4/3] bg-surface-variant dark:bg-surface-variant-dark overflow-hidden shrink-0">
    {src ? (
      <img src={src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
    ) : (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-content-tertiary dark:text-content-tertiary-dark">
        <span className="text-6xl select-none">{fallbackEmoji || '🥘'}</span>
      </div>
    )}
    {children}
  </div>
);

export const CardFloatingAction: React.FC<{ 
  icon: React.ReactNode; 
  onClick?: (e: React.MouseEvent) => void; 
  active?: boolean; 
  activeColor?: string; 
}> = ({ icon, onClick, active }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
    className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-lg transition-transform active:scale-90 flex items-center justify-center ${
      active
        ? 'bg-success text-white'
        : 'bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark hover:bg-primary-container dark:hover:bg-primary-container-dark'
    }`}
  >
    {icon}
  </button>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 flex flex-col flex-1 gap-3 min-w-0">
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="font-bold text-lg text-content dark:text-content-dark google-sans line-clamp-1 group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-content-secondary dark:text-content-secondary-dark line-clamp-2 leading-relaxed">
    {children}
  </p>
);

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-auto px-4 pb-4 pt-3 border-t border-outline/50 dark:border-outline-dark/50 relative">
    {children}
  </div>
);

export const IngredientBadges: React.FC<{ ingredients: any[]; limit?: number }> = ({ ingredients, limit = 3 }) => (
   <>
    <div className="flex flex-nowrap items-center gap-1.5 overflow-hidden">
      {ingredients.slice(0, limit).map((ing, idx) => (
        <Badge key={idx} variant="neutral" label={ing.name} className="max-w-[100px] truncate shrink-0" />
      ))}
      {ingredients.length > limit && (
        <span className="text-2xs font-bold text-content-tertiary dark:text-content-tertiary-dark self-center px-1 shrink-0">
          +{ingredients.length - limit}
        </span>
      )}
    </div>
    <div className="absolute top-3 right-0 bottom-0 w-12 bg-gradient-to-l from-surface to-transparent dark:from-surface-dark pointer-events-none" />
   </>
);

// --- LEVEL 3: SEMANTIC COMPONENTS (Legacy / Specific) ---

// 1. SECTION CARD (Standard Header + Content)
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

// 2. GENIE CARD (Idea List Item)
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

// 3. PROCESS CARD (Orchestration Step)
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

// 4. INSIGHT CARD (Summary / Stats)
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

// --- LEGACY/COMPATIBILITY ---
export const CardWrapper: React.FC<any> = (props) => {
  if (props.title || props.icon || props.action) return <SectionCard {...props} />;
  return <BaseCard {...props} />;
};

// --- SKELETONS ---
export const RecipeSkeleton = () => (
  <BaseCard noPadding className="h-full border-outline/50 dark:border-outline-dark/50">
    <div className="aspect-[4/3] bg-surface-variant/80 dark:bg-surface-variant-dark/80 animate-pulse" />
    <div className="p-4 flex flex-col gap-3 flex-1">
      <div className="space-y-2">
        <div className="h-5 bg-surface-variant dark:bg-surface-variant-dark rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-surface-variant/50 dark:bg-surface-variant-dark/50 rounded w-full animate-pulse" />
      </div>
      <div className="mt-auto pt-3 border-t border-outline/30 dark:border-outline-dark/30 flex gap-2">
         <div className="h-5 w-16 bg-surface-variant/50 dark:bg-surface-variant-dark/50 rounded animate-pulse" />
      </div>
    </div>
  </BaseCard>
);

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
