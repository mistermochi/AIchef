
import React from 'react';
import { Badge } from './DataDisplay';
import { BaseCard } from './cards/BaseCard';

// Re-export new atomic cards
export * from './cards/BaseCard';
export * from './cards/GenieCard';
export * from './cards/ProcessCard';
export * from './cards/InsightCard';
export * from './cards/SectionCard';

// --- COMPOSABLE BLOCKS ---

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
      <img 
        src={src} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        alt="Cover"
        loading="lazy"
        decoding="async"
      />
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
