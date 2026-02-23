
import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useHaptics } from '../../shared/lib/hooks/useHaptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  label?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  loading, 
  children, 
  fullWidth, 
  className = '', 
  disabled,
  label,
  onClick,
  ...props 
}) => {
  const { trigger } = useHaptics();
  const base = "inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary dark:bg-primary-dark text-white hover:bg-primary-hover dark:hover:bg-primary-hover-dark shadow-sm",
    secondary: "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark border border-transparent dark:border-outline-dark",
    ghost: "bg-transparent hover:bg-surface-variant dark:hover:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark",
    danger: "bg-danger-container dark:bg-danger-container-dark text-danger dark:text-danger-dark hover:opacity-80"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2.5",
    icon: "p-2 gap-0",
    'icon-sm': "p-1.5 gap-0"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
        trigger(variant === 'danger' ? 'heavy' : 'light');
    }
    onClick?.(e);
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? <Loader2 className={`animate-spin ${size.includes('sm') ? 'w-3 h-3' : 'w-4 h-4'}`} /> : 
       icon ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: size.includes('sm') ? 'w-3.5 h-3.5' : 'w-4 h-4' }) : null}
      {label && <span className="hidden sm:inline">{label}</span>}
      {children}
    </button>
  );
};

export interface HeaderActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  activeColor?: 'primary' | 'success';
  label?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const HeaderAction: React.FC<HeaderActionProps> = ({ 
  active, 
  activeColor = 'primary', 
  label, 
  icon, 
  loading, 
  className = '', 
  disabled,
  onClick,
  ...props 
}) => {
  const { trigger } = useHaptics();
  const base = "inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none px-4 py-2 text-sm gap-2 border";
  
  const styles = active
    ? (activeColor === 'success' 
       ? "bg-success-container dark:bg-success-container-dark text-success-dark dark:text-success-dark border-success-container-dark/20 dark:border-success-dark/30"
       : "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark border-primary/20 dark:border-primary-dark/20")
    : "bg-transparent border-transparent text-content-secondary dark:text-content-secondary-dark hover:bg-black/5 dark:hover:bg-white/10";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) trigger('light');
      onClick?.(e);
  };

  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled || loading} onClick={handleClick} {...props}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 
       icon ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" }) : null}
      {label && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
};

export const IconButton: React.FC<ButtonProps> = (props) => <Button size="icon" variant="ghost" {...props} />;
export const HeaderActionSeparator: React.FC = () => <div className="w-px h-6 bg-outline dark:bg-outline-dark mx-1" />;
export const ActionBar: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>{children}</div>
);

// --- CONFIRM BUTTON ---

interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick' | 'variant'> {
  onConfirm: () => void;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary' | 'secondary';
  variant?: ButtonProps['variant'];
  isHeaderAction?: boolean;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  onConfirm,
  label,
  confirmLabel = "Confirm?",
  icon,
  variant = 'ghost',
  confirmVariant = 'danger',
  isHeaderAction = false,
  className = '',
  ...props
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { trigger } = useHaptics();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsConfirming(false);
      }
    };
    if (isConfirming) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isConfirming]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirming) {
      trigger('heavy');
      onConfirm();
      setIsConfirming(false);
    } else {
      trigger('medium');
      setIsConfirming(true);
    }
  };

  const Component = isHeaderAction ? HeaderAction : Button;
  
  // Specific styling to match the established "Delete Warning" look
  const dangerActiveClasses = "!bg-danger !text-white hover:!bg-danger/90 border-danger animate-in zoom-in duration-200";
  
  const finalClassName = isConfirming && confirmVariant === 'danger' 
    ? `${className} ${dangerActiveClasses}` 
    : className;

  return (
    <div ref={wrapperRef} className="inline-block transition-all duration-300">
      <Component 
        {...props}
        onClick={handleClick}
        label={isConfirming ? confirmLabel : label}
        icon={icon}
        variant={isConfirming ? (confirmVariant as any) : variant}
        className={finalClassName}
        // Ensure HeaderAction active state doesn't override our danger styles with blue
        active={isConfirming && confirmVariant !== 'danger'} 
      />
    </div>
  );
};

// --- FAB (Floating Action Button) ---

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'surface';
  loading?: boolean;
}

export const FAB: React.FC<FABProps> = ({ 
  icon, 
  label, 
  variant = 'primary', 
  className = '', 
  loading, 
  disabled,
  onClick,
  ...props 
}) => {
  const { trigger } = useHaptics();
  const base = "flex items-center justify-center gap-2 rounded-2xl shadow-lg transition-all duration-300 active:scale-95 hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none z-40";
  
  const variants = {
    primary: "bg-primary dark:bg-primary-dark text-white hover:bg-primary-hover dark:hover:bg-primary-hover-dark",
    secondary: "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark hover:brightness-95",
    surface: "bg-surface dark:bg-surface-dark text-primary dark:text-primary-dark border border-outline/50 dark:border-outline-dark/50 hover:bg-surface-variant dark:hover:bg-surface-variant-dark",
  };

  const sizing = label 
    ? "h-14 px-5 pr-6 min-w-[110px]" 
    : "w-14 h-14"; 

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) trigger('medium');
    onClick?.(e);
  };

  return (
    <button 
      className={`${base} ${variants[variant] || variants.primary} ${sizing} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        icon && React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })
      )}
      {label && (
        <span className="font-medium text-base font-google tracking-wide">{label}</span>
      )}
    </button>
  );
};
