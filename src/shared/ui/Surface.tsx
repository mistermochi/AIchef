
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children, size = 'lg', className = '' }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full m-0 h-full rounded-none',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop with Fade In */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      {/* Modal with Slide Up Entry */}
      <div className={`relative w-full bg-surface dark:bg-surface-dark flex flex-col shadow-2xl transition-all sm:rounded-2xl max-h-[95vh] overflow-hidden animate-enter-up ${sizes[size]} ${className}`}>
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export const ModalHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}> = ({ title, subtitle, actions, onClose, className = '' }) => {
  return (
    <div className={`h-14 border-b border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark flex items-center justify-between px-4 sm:px-6 shrink-0 z-50 transition-colors ${className}`}>
      <div className="flex items-center gap-3 min-w-0 overflow-hidden flex-1 mr-4">
         <div className="min-w-0 flex flex-col justify-center">
            {typeof title === 'string' ? (
                <div className="text-sm font-bold text-content dark:text-content-dark google-sans truncate leading-tight">{title}</div>
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
  <div className={`flex-1 overflow-y-auto custom-scrollbar bg-surface-variant dark:bg-surface-variant-dark flex flex-col ${noPadding ? '' : 'p-4 md:p-8'} ${className}`}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`p-4 bg-surface dark:bg-surface-dark border-t border-outline dark:border-outline-dark shrink-0 ${className}`}>
    {children}
  </div>
);

export const PageLayout: React.FC<{ 
  header?: React.ReactNode; 
  children: React.ReactNode; 
  className?: string;
  contentClassName?: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ header, children, className = '', contentClassName = '', scrollRef }) => (
  <div className={`h-full flex flex-col animate-in fade-in duration-500 ${className}`}>
    {header}
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24 md:pb-6" ref={scrollRef}>
      <div className={`max-w-7xl mx-auto min-h-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  </div>
);

export const GridList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr ${className}`}>
    {children}
  </div>
);
