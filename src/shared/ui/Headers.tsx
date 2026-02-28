import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb"

interface PageHeaderProps {
  title: string;
  breadcrumbs?: string[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ breadcrumbs, action }) => (
  <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0 sticky top-0 z-20 transition-colors">
    <Breadcrumb>
      <BreadcrumbList className="text-sm font-medium text-muted-foreground sm:gap-2 gap-1.5">
        <BreadcrumbItem>
          <span>ChefAI Studio</span>
        </BreadcrumbItem>
        {breadcrumbs?.map((crumb, i) => (
          <React.Fragment key={i}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {i === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="text-foreground font-bold">
                  {crumb}
                </BreadcrumbPage>
              ) : (
                <span>{crumb}</span>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
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
         <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-colors">
           {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5 md:w-6 md:h-6 text-primary-foreground" })}
         </div>
       )}
       <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-bold text-foreground google-sans leading-tight truncate pr-2">{title}</h2>
          {subtitle && (typeof subtitle === 'string' ? (
             <p className="text-sm text-muted-foreground mt-1 truncate">{subtitle}</p>
          ) : (
             <div className="mt-1">{subtitle}</div>
          ))}
       </div>
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);
