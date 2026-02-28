import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { X, Sparkles, ArrowUp } from "lucide-react"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    label?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    onClear?: () => void;
  }
>(({ className, type, label, startIcon, endIcon, onClear, ...props }, ref) => {
  const hasValue = !!(props.value && props.value.toString().length > 0);

  return (
    <div className="relative w-full group/input">
      {label && <label className="text-2xs font-bold text-content-tertiary dark:text-content-tertiary-dark uppercase tracking-widest mb-1.5 block px-1">{label}</label>}
      {startIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary dark:text-content-tertiary-dark pointer-events-none transition-colors group-focus-within/input:text-primary">
          {React.isValidElement(startIcon) && React.cloneElement(startIcon as React.ReactElement<any>, { size: 16 })}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "bg-surface dark:bg-surface-dark border-outline dark:border-outline-dark focus-visible:ring-primary/20 focus:border-primary dark:focus:border-primary-dark transition-all",
          startIcon ? 'pl-10' : 'pl-4',
          onClear && hasValue ? 'pr-9' : (endIcon ? 'pr-10' : 'pr-4'),
          className
        )}
        ref={ref}
        {...props}
      />
      {onClear && hasValue && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClear();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-content-tertiary hover:text-content hover:bg-surface-variant dark:hover:bg-surface-variant-dark transition-all active:scale-90 animate-in fade-in zoom-in duration-200"
          title="Clear input"
        >
          <X size={14} />
        </button>
      )}
      {endIcon && !(onClear && hasValue) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary dark:text-content-tertiary-dark pointer-events-none">
          {React.isValidElement(endIcon) && React.cloneElement(endIcon as React.ReactElement<any>, { size: 16 })}
        </div>
      )}
    </div>
  )
})
Input.displayName = "Input"

// --- PROMPT INPUT ---

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  actions?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
}

export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(({
  value, onChange, onSubmit, loading, placeholder, disabled, error, actions, className = '', autoFocus
}, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  const textareaRef = (ref as any) || internalRef;

  // Auto-resize logic
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, textareaRef]);

  const containerBaseClass = "rounded-xl p-4 flex flex-col gap-2 transition-all shadow-lg group";
  const normalClass = "bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark focus-within:border-primary dark:focus-within:border-primary-dark focus-within:ring-1 focus-within:ring-primary/10 dark:focus-within:ring-primary-dark/10";
  const loadingClass = "relative bg-surface dark:bg-surface-dark bg-clip-padding border border-transparent";
  const gradientWrapperClass = "absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary via-accent to-primary animate-gradient-xy -z-10";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {error && (
        <p className="text-2xs text-danger dark:text-danger-dark font-bold uppercase animate-pulse px-1 text-center sm:text-left">
          {error}
        </p>
      )}
      
      <div className="relative">
        {loading && <div className={gradientWrapperClass} />}
        
        <div className={cn(containerBaseClass, loading ? loadingClass : normalClass)}>
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-content dark:text-content-dark placeholder:text-content-tertiary dark:placeholder:text-content-tertiary-dark min-h-[50px] max-h-[240px] leading-relaxed custom-scrollbar font-normal"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (value.trim() && !loading && !disabled) onSubmit();
              }
            }}
            disabled={disabled || loading}
            autoFocus={autoFocus}
            rows={1}
          />
          
          <div className="flex items-center justify-end gap-1">
            {actions}
            {actions && <div className="w-2"></div>}
            
            <button
              onClick={onSubmit}
              disabled={disabled || loading || !value.trim()}
              className={cn(
                "w-10 h-10 text-white rounded-lg flex items-center justify-center transition-all disabled:bg-surface-variant dark:disabled:bg-surface-variant-dark disabled:text-content-tertiary dark:disabled:text-content-tertiary-dark active:scale-95 shrink-0 shadow-sm",
                loading ? 'bg-transparent text-primary dark:text-primary-dark' : 'bg-primary dark:bg-primary-dark hover:bg-primary-hover dark:hover:bg-primary-hover-dark'
              )}
            >
               {loading ? <Sparkles className="w-5 h-5 animate-pulse" /> : <ArrowUp className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
PromptInput.displayName = "PromptInput"

export { Input }
