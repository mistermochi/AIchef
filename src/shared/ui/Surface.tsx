
import React from 'react';
import { cn } from "@/shared/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog"
import { X } from 'lucide-react';

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen = true, onClose, children, size = 'lg', className = '' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full m-0 h-full rounded-none',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl max-h-[95vh]",
          sizes[size],
          className
        )}
        // Disable default close button because we use ModalHeader
        hideCloseButton
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export const ModalHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}> = ({ title, subtitle, actions, onClose, className = '' }) => {
  return (
    <div className={cn("h-14 border-b border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 transition-colors", className)}>
      <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1 mr-4">
         <div className="min-w-0 flex flex-col justify-center">
            {typeof title === 'string' ? (
                <DialogTitle className="text-sm font-bold text-content dark:text-content-dark google-sans truncate leading-tight">{title}</DialogTitle>
            ) : title}
            
            {subtitle && (
                <div className="text-xs text-content-secondary dark:text-content-secondary-dark truncate font-medium mt-0.5">{subtitle}</div>
            )}
         </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
         {actions && <div className="flex items-center gap-2">{actions}</div>}
         
         {onClose && (
           <>
             {actions && <div className="w-px h-6 bg-outline dark:bg-outline-dark mx-1" />}
             <button 
               onClick={onClose} 
               className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-content-secondary dark:text-content-secondary-dark transition-colors"
             >
               <X className="w-5 h-5" />
             </button>
           </>
         )}
      </div>
    </div>
  );
};

export const ModalContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}> = ({ children, className = '', noPadding = false }) => (
  <div className={cn("flex-1 overflow-y-auto custom-scrollbar bg-surface-variant dark:bg-surface-variant-dark flex flex-col", noPadding ? '' : 'p-4 md:p-8', className)}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <DialogFooter className={cn("p-4 bg-surface dark:bg-surface-dark border-t border-outline dark:border-outline-dark shrink-0 sm:justify-start", className)}>
    {children}
  </DialogFooter>
);

export const PageLayout: React.FC<{ 
  header?: React.ReactNode; 
  children: React.ReactNode; 
  className?: string;
  contentClassName?: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ header, children, className = '', contentClassName = '', scrollRef }) => (
  <div className={cn("h-full flex flex-col animate-in fade-in duration-500", className)}>
    {header}
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24 md:pb-6" ref={scrollRef}>
      <div className={cn("max-w-7xl mx-auto min-h-full", contentClassName)}>
        {children}
      </div>
    </div>
  </div>
);

export const GridList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr", className)}>
    {children}
  </div>
);
