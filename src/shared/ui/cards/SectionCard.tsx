
import React from 'react';
import { Card } from '../card';
import { cn } from "@/shared/lib/utils"

export interface SectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, icon, action, footer, children, className = '', noPadding = false, ...props }) => {
  return (
    <Card className={cn("overflow-hidden flex flex-col", className)} {...props as any}>
      <div className="h-10 px-4 border-b border-border flex items-center justify-between shrink-0 bg-muted/30">
         <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] truncate text-muted-foreground">
            {icon && React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { className: "w-3.5 h-3.5" })}
            <span>{title}</span>
         </div>
         <div className="flex items-center gap-2">{action}</div>
      </div>
      <div className={cn("flex-1 flex flex-col min-h-0 w-full", noPadding ? '' : 'p-4 md:p-6')}>
        {children}
      </div>
      {footer && <div className="mt-auto pt-3 border-t border-border p-4 bg-muted/10">{footer}</div>}
    </Card>
  );
};
