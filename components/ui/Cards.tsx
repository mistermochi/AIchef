import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  media?: React.ReactNode;
  noPadding?: boolean;
  variant?: 'default' | 'prep' | 'cook' | 'wait' | 'summary';
  onClickHeader?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  title, subtitle, icon, action, footer, media, noPadding, variant = 'default', onClickHeader, children, className = '', ...props 
}) => {
  const showHeader = (title || icon || action) && !media && variant !== 'summary';
  
  const processStyles = {
    prep: "bg-primary-container dark:bg-primary-container-dark border-primary/20 dark:border-primary-dark/30 text-primary dark:text-primary-dark",
    cook: "bg-warning-container dark:bg-warning-container-dark border-warning/20 dark:border-warning/30 text-warning-on-container dark:text-warning-on-container-dark",
    wait: "bg-accent-container dark:bg-accent-container-dark border-accent/20 dark:border-accent/30 text-accent-on-container dark:text-accent-on-container-dark",
    default: "bg-surface-variant dark:bg-surface-variant-dark border-outline dark:border-outline-dark text-content-secondary dark:text-content-tertiary-dark",
    summary: ""
  };

  return (
    <div className={`bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-2xl shadow-sm transition-colors overflow-hidden flex flex-col ${className}`} {...props}>
      {showHeader && (
        <div 
          onClick={onClickHeader}
          className={`h-10 px-4 border-b flex items-center justify-between shrink-0 transition-colors ${processStyles[variant]} ${onClickHeader ? 'cursor-pointer hover:opacity-90' : ''}`}
        >
           <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider truncate">
              {icon && React.cloneElement(icon as React.ReactElement, { className: "w-3.5 h-3.5" })}
              <span>{title}</span>
           </div>
           <div className="flex items-center gap-2">
             {subtitle && <span className="text-xs font-mono font-medium opacity-80">{subtitle}</span>}
             {action}
           </div>
        </div>
      )}

      {media || variant === 'summary' ? (
         <div className="flex flex-row gap-4 p-4 md:p-6 items-start">
            {media && <div className="shrink-0">{media}</div>}
            <div className="flex-1 min-w-0 w-full">
               <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                  <div className="space-y-2 flex-1 min-w-0">
                     <div className="text-xl font-bold text-content dark:text-content-dark google-sans leading-tight">{title}</div>
                     {subtitle && <div className="text-sm text-content-secondary dark:text-content-secondary-dark leading-relaxed">{subtitle}</div>}
                  </div>
                  {action && <div className="shrink-0 pt-1">{action}</div>}
               </div>
               {children}
               {footer && <div className="mt-2 pt-3 border-t border-outline/50 dark:border-outline-dark/50">{footer}</div>}
            </div>
         </div>
      ) : (
         <div className={`flex-1 flex flex-col min-h-0 w-full ${noPadding ? '' : 'p-4 md:p-6'}`}>
            {children}
            {footer && <div className="mt-auto pt-3 border-t border-outline/30 dark:border-outline-dark/30">{footer}</div>}
         </div>
      )}
    </div>
  );
};

export const SectionCard: React.FC<CardProps> = (props) => <Card {...props} noPadding={props.noPadding ?? true} />;
export const ProcessCard: React.FC<CardProps & { type: CardProps['variant'] }> = ({ type, ...props }) => <Card variant={type} noPadding {...props} />;
export const SummaryCard: React.FC<CardProps & { description?: React.ReactNode }> = ({ description, ...props }) => <Card variant="summary" subtitle={description} {...props} noPadding={false} />;

export const RecipeSkeleton = () => (
  <Card noPadding className="h-full border-outline/50 dark:border-outline-dark/50">
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
  </Card>
);

export const GenieSkeleton = () => (
  <Card className="animate-pulse border-outline/50 dark:border-outline-dark/50">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-variant dark:bg-surface-variant-dark rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 py-1 space-y-2">
        <div className="h-4 bg-surface-variant dark:bg-surface-variant-dark rounded w-1/3" />
        <div className="h-3 bg-surface-variant/50 dark:bg-surface-variant-dark/50 rounded w-3/4" />
      </div>
    </div>
  </Card>
);
