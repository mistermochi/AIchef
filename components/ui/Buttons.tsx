import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'header';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  active?: boolean;
  activeColor?: 'primary' | 'success';
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
  active,
  activeColor = 'primary',
  label,
  ...props 
}) => {
  const base = "inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary dark:bg-primary-dark text-white hover:bg-primary-hover dark:hover:bg-primary-hover-dark shadow-sm",
    secondary: "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark border border-transparent dark:border-outline-dark",
    ghost: "bg-transparent hover:bg-surface-variant dark:hover:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark",
    danger: "bg-danger-container dark:bg-danger-container-dark text-danger dark:text-danger-dark hover:opacity-80",
    header: active
      ? (activeColor === 'success' 
         ? "bg-success-container dark:bg-success-container-dark text-success-dark dark:text-success-dark border-success-container-dark/20 dark:border-success-dark/30 border"
         : "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark border-primary/20 dark:border-primary-dark/20 border")
      : "bg-transparent border border-transparent text-content-secondary dark:text-content-secondary-dark hover:bg-black/5 dark:hover:bg-white/10"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2.5",
    icon: "p-2 gap-0",
    'icon-sm': "p-1.5 gap-0"
  };

  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className={`animate-spin ${size.includes('sm') ? 'w-3 h-3' : 'w-4 h-4'}`} /> : 
       icon ? React.cloneElement(icon as React.ReactElement, { className: size.includes('sm') ? 'w-3.5 h-3.5' : 'w-4 h-4' }) : null}
      {label && <span className="hidden sm:inline">{label}</span>}
      {children}
    </button>
  );
};

export const IconButton: React.FC<ButtonProps> = (props) => <Button size="icon" variant="ghost" {...props} />;
export const HeaderAction: React.FC<ButtonProps> = ({isActive, ...props}) => <Button variant="header" active={isActive} {...props} />;
export const HeaderActionSeparator: React.FC = () => <div className="w-px h-6 bg-outline dark:bg-outline-dark mx-1" />;
export const ActionBar: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>{children}</div>
);
