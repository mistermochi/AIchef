import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from 'lucide-react'

import { cn } from "@/shared/lib/utils"
import { useHaptics } from "../lib/hooks/useHaptics"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
        secondary: "bg-primary-container text-primary border border-transparent dark:border-outline-dark",
        ghost: "bg-transparent hover:bg-surface-variant dark:hover:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark",
        danger: "bg-danger-container text-danger hover:opacity-80",
        // Keep shadcn defaults for compatibility
        default: "bg-primary text-white hover:bg-primary-hover shadow-sm",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
        md: "h-10 px-4 text-sm rounded-xl gap-2",
        lg: "h-12 px-6 text-sm rounded-xl gap-2.5",
        icon: "h-9 w-9 rounded-xl p-2 gap-0",
        'icon-sm': "h-7 w-7 rounded-xl p-1.5 gap-0",
        default: "h-10 px-4 py-2 rounded-xl",
      },
      fullWidth: {
        true: "w-full",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  label?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, icon, label, children, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const { trigger } = useHaptics()

    // Auto-detect icon size based on button size
    const iconSizeClass = size === 'sm' || size === 'icon-sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!props.disabled && !loading) {
        trigger(variant === 'danger' ? 'heavy' : 'light')
      }
      onClick?.(e)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
            <Loader2 className={cn("animate-spin", iconSizeClass)} />
        ) : (
            icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, {
                className: cn((icon as React.ReactElement<any>).props.className, iconSizeClass)
            }) : null
        )}
        {label && <span className="hidden sm:inline">{label}</span>}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Additional components from original Buttons.tsx

export interface HeaderActionProps extends ButtonProps {
  active?: boolean;
  activeColor?: 'primary' | 'success';
}

export const HeaderAction = React.forwardRef<HTMLButtonElement, HeaderActionProps>(({
  active,
  activeColor = 'primary',
  className,
  ...props
}, ref) => {
  const styles = active
    ? (activeColor === 'success'
       ? "bg-success-container dark:bg-success-container-dark text-success-dark dark:text-success-dark border-success-container-dark/20 dark:border-success-dark/30"
       : "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark border-primary/20 dark:border-primary-dark/20")
    : "bg-transparent border-transparent text-content-secondary dark:text-content-secondary-dark hover:bg-black/5 dark:hover:bg-white/10";

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn("px-4 py-2 text-sm gap-2 border font-bold rounded-xl", styles, className)}
      {...props}
    />
  )
})
HeaderAction.displayName = "HeaderAction"

export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
  <Button ref={ref} size="icon" variant="ghost" {...props} />
))
IconButton.displayName = "IconButton"

export const HeaderActionSeparator: React.FC = () => (
  <div className="w-px h-6 bg-outline dark:bg-outline-dark mx-1" />
)

export const ActionBar: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={cn("flex items-center gap-2", className)}>{children}</div>
)

// --- CONFIRM BUTTON ---

interface ConfirmButtonProps extends Omit<ButtonProps, 'onClick' | 'variant'> {
  onConfirm: () => void;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary' | 'secondary';
  variant?: ButtonProps['variant'];
  isHeaderAction?: boolean;
}

export const ConfirmButton = React.forwardRef<HTMLButtonElement, ConfirmButtonProps>(({
  onConfirm,
  label,
  confirmLabel = "Confirm?",
  icon,
  variant = 'ghost',
  confirmVariant = 'danger',
  isHeaderAction = false,
  className,
  ...props
}, ref) => {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const { trigger } = useHaptics();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsConfirming(false);
      }
    };
    if (isConfirming) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isConfirming]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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

  const Component = isHeaderAction ? (HeaderAction as any) : Button;

  const dangerActiveClasses = "!bg-danger !text-white hover:!bg-danger/90 border-danger animate-in zoom-in duration-200";

  const finalClassName = isConfirming && confirmVariant === 'danger'
    ? cn(className, dangerActiveClasses)
    : className;

  return (
    <div ref={wrapperRef} className="inline-block transition-all duration-300">
      <Component
        {...props}
        ref={ref}
        onClick={handleClick}
        label={isConfirming ? confirmLabel : label}
        icon={icon}
        variant={isConfirming ? (confirmVariant as any) : variant}
        className={finalClassName}
        active={isConfirming && confirmVariant !== 'danger'}
      />
    </div>
  );
});
ConfirmButton.displayName = "ConfirmButton"

// --- FAB (Floating Action Button) ---

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'surface';
  loading?: boolean;
}

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(({
  icon,
  label,
  variant = 'primary',
  className,
  loading,
  onClick,
  ...props
}, ref) => {
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

  const iconSizeClass = "w-6 h-6";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!props.disabled && !loading) trigger('medium');
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant] || variants.primary, sizing, className)}
      disabled={props.disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn("animate-spin", iconSizeClass)} />
      ) : (
        icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, {
            className: cn((icon as React.ReactElement<any>).props.className, iconSizeClass)
        }) : null
      )}
      {label && (
        <span className="font-medium text-base font-google tracking-wide">{label}</span>
      )}
    </button>
  );
});
FAB.displayName = "FAB"

export { Button, buttonVariants }
