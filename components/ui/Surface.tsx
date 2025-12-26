import React from 'react';

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children, size = 'lg', className = '' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full m-0 h-full rounded-none',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={`relative w-full bg-surface dark:bg-surface-dark flex flex-col shadow-2xl transition-all sm:rounded-2xl max-h-[95vh] overflow-hidden ${sizes[size]} ${className}`}>
        {children}
      </div>
    </div>
  );
};

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
