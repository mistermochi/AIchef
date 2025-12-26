import React from 'react';

interface PageHeaderProps {
  title: string;
  breadcrumbs?: string[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, action }) => (
  <header className="h-14 border-b border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark flex items-center justify-between px-6 shrink-0 sticky top-0 z-20 transition-colors">
    <div className="flex items-center gap-2 text-sm font-medium text-content-secondary dark:text-content-secondary-dark">
      <span>ChefAI Studio</span>
      {breadcrumbs?.map((crumb, i) => (
        <React.Fragment key={i}>
          <span className="text-outline dark:text-content-tertiary-dark text-sm font-normal">/</span>
          <span className={i === breadcrumbs.length - 1 ? "text-content dark:text-content-dark font-bold" : ""}>{crumb}</span>
        </React.Fragment>
      ))}
    </div>
    {action}
  </header>
);

interface ViewHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({ title, subtitle, icon, actions, className = '' }) => (
  <div className={`flex items-center justify-between gap-4 mb-6 shrink-0 ${className}`}>
    <div className="flex items-center gap-4 flex-1 min-w-0">
       {icon && (
         <div className="w-10 h-10 md:w-12 md:h-12 bg-primary dark:bg-primary-dark rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-colors">
           {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5 md:w-6 md:h-6 text-white" })}
         </div>
       )}
       <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-content dark:text-content-dark google-sans leading-tight truncate pr-2">{title}</h2>
          {subtitle && (typeof subtitle === 'string' ? (
             <p className="text-sm text-content-secondary dark:text-content-secondary-dark mt-1 truncate">{subtitle}</p>
          ) : (
             <div className="mt-1">{subtitle}</div>
          ))}
       </div>
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);
