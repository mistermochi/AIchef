
import React from 'react';
import { Loader2, ArrowUp } from 'lucide-react';

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

export const PromptInput: React.FC<PromptInputProps> = ({
  value, onChange, onSubmit, loading, placeholder, disabled, error, actions, className = '', autoFocus
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {error && (
        <p className="text-2xs text-danger dark:text-danger-dark font-bold uppercase animate-pulse px-1 text-center sm:text-left">
          {error}
        </p>
      )}
      <div className="bg-surface dark:bg-surface-dark rounded-xl border border-outline dark:border-outline-dark p-4 flex flex-col gap-2 transition-all focus-within:border-primary dark:focus-within:border-primary-dark focus-within:ring-1 focus-within:ring-primary/10 dark:focus-within:ring-primary-dark/10 shadow-lg group">
        <textarea
          className="w-full bg-transparent border-none outline-none resize-none text-sm text-content dark:text-content-dark placeholder:text-content-tertiary dark:placeholder:text-content-tertiary-dark min-h-[50px] max-h-[120px] leading-relaxed custom-scrollbar font-normal"
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
        />
        
        <div className="flex items-center justify-end gap-1">
          {actions}
          {actions && <div className="w-2"></div>}
          
          <button
            onClick={onSubmit}
            disabled={disabled || loading || !value.trim()}
            className="w-10 h-10 bg-primary dark:bg-primary-dark text-white rounded-lg flex items-center justify-center transition-all hover:bg-primary-hover dark:hover:bg-primary-hover-dark disabled:bg-surface-variant dark:disabled:bg-surface-variant-dark disabled:text-content-tertiary dark:disabled:text-content-tertiary-dark active:scale-95 shrink-0 shadow-sm"
          >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- STANDARD INPUTS ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ className = '', startIcon, endIcon, ...props }) => {
  return (
    <div className="relative w-full">
      {startIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary dark:text-content-tertiary-dark pointer-events-none">
          {React.cloneElement(startIcon as React.ReactElement<any>, { size: 16 })}
        </div>
      )}
      <input
        className={`w-full bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-lg py-2 text-sm outline-none focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-all placeholder:text-content-secondary dark:placeholder:text-content-secondary-dark shadow-sm text-content dark:text-content-dark disabled:opacity-50 ${startIcon ? 'pl-10' : 'pl-4'} ${endIcon ? 'pr-10' : 'pr-4'} ${className}`}
        {...props}
      />
      {endIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary dark:text-content-tertiary-dark pointer-events-none">
          {React.cloneElement(endIcon as React.ReactElement<any>, { size: 16 })}
        </div>
      )}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`w-full bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-lg p-3 text-sm outline-none focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary dark:focus:ring-primary-dark transition-all placeholder:text-content-secondary dark:placeholder:text-content-secondary-dark shadow-inner text-content dark:text-content-dark resize-none custom-scrollbar disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

// --- SWITCH ---

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, className = '' }) => {
  return (
    <button 
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary dark:bg-primary-dark' : 'bg-outline dark:bg-outline-dark'} ${className}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
};
