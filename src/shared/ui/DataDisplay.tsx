
import React, { useState, useEffect, useRef } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';
import { useHaptics } from '../lib/hooks/useHaptics';

// --- TYPEWRITER ---
export const Typewriter: React.FC<{ text: string; speed?: number; className?: string; animate?: boolean }> = ({ text, speed = 15, className = '', animate = true }) => {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let i = 1;
    const timer = setInterval(() => {
      // Use slice to ensure deterministic output relative to 'text' prop
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, animate]);

  return <span className={className}>{displayedText}</span>;
};

// --- COUNT UP ---
export const CountUp: React.FC<{ value: number; duration?: number; className?: string }> = React.memo(({ value, duration = 300, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const startValue = useRef(value);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startValue.current = displayValue;
    startTime.current = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue.current + (value - startValue.current) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  // Format to remove trailing decimals if integer, else fixed to 2
  const formatted = Number.isInteger(displayValue) 
    ? displayValue.toString() 
    : displayValue.toFixed(2);

  return <span className={className}>{formatted}</span>;
});

// --- BASE ROW (Shared Foundation) ---
interface BaseRowProps {
  leading?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onDelete?: () => void;
  onClick?: () => void;
  isChecked?: boolean;
  className?: string;
}

const BaseRow: React.FC<BaseRowProps> = React.memo(({ leading, children, actions, onDelete, onClick, isChecked, className = '' }) => (
  <div 
    onClick={onClick}
    className={`flex items-stretch group border-b border-outline/30 dark:border-outline-dark/30 last:border-none transition-colors 
    ${isChecked ? 'bg-primary-container/30 dark:bg-primary-container-dark/20' : 'hover:bg-surface-variant/50 dark:hover:bg-surface-variant-dark/50'} 
    ${className}`}
  >
    {leading && (
      <div className="w-12 sm:w-14 shrink-0 flex items-center justify-center bg-black/5 dark:bg-white/5 border-r border-outline/30 dark:border-outline-dark/30 text-content-tertiary dark:text-content-tertiary-dark">
        {leading}
      </div>
    )}
    <div className="flex-1 p-4 min-w-0 flex items-center">
      <div className="w-full">{children}</div>
    </div>
    {(actions || onDelete) && (
      <div className="shrink-0 flex items-center pr-3 gap-1">
        {actions}
        {onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="p-2 rounded-lg transition-all opacity-100 bg-danger-container/50 text-danger hover:bg-danger-container"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )}
  </div>
));

// --- EDITABLE LIST ---
interface EditableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isEditing: boolean) => React.ReactNode;
  onAdd: () => void;
  isEditing: boolean;
  addButtonLabel?: string;
  className?: string;
}

export function EditableList<T>({ items, renderItem, onAdd, isEditing, addButtonLabel = "Add Item", className = '' }: EditableListProps<T>) {
  return (
    <div className={className}>
      {items.map((it: T, i: number) => renderItem(it, i, isEditing))}
      {isEditing && (
        <button onClick={onAdd} className="w-full py-4 bg-surface-variant/50 dark:bg-surface-variant-dark/30 text-primary dark:text-primary-dark text-xs font-bold uppercase hover:bg-primary-container dark:hover:bg-primary-container-dark border-t border-outline/30 dark:border-outline-dark/30 flex items-center justify-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> {addButtonLabel}
        </button>
      )}
    </div>
  );
}

// --- LIST ROW (For Instructions/Tips) ---
interface ListRowProps {
  leading?: React.ReactNode;
  content: string | React.ReactNode;
  isEditing?: boolean;
  onChange?: (val: string) => void;
  onDelete?: () => void;
  onClick?: () => void;
  placeholder?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const ListRow: React.FC<ListRowProps> = React.memo(({ 
  leading, 
  content, 
  isEditing = false, 
  onChange, 
  onDelete, 
  onClick, 
  placeholder,
  actions,
  className 
}) => (
  <BaseRow leading={leading} onClick={onClick} onDelete={isEditing ? onDelete : undefined} actions={actions} className={className}>
    {isEditing ? (
      <textarea
        value={typeof content === 'string' ? content : ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-lg p-3 text-sm outline-none shadow-sm focus:border-primary transition-all resize-none"
        rows={Math.max(2, Math.min(5, (typeof content === 'string' ? content : '').split('\n').length))}
      />
    ) : (
      <div className="text-sm text-content-secondary dark:text-content-secondary-dark font-medium leading-relaxed whitespace-pre-wrap">{content}</div>
    )}
  </BaseRow>
));

// --- INGREDIENT COMPONENTS (Composable) ---

// 1. INPUT ROW (Edit Mode)
export const IngredientInput: React.FC<{
  name: string;
  quantity: number;
  unit: string;
  onChange: (field: 'name' | 'quantity' | 'unit', val: string | number) => void;
  onDelete: () => void;
}> = React.memo(({ name, quantity, unit, onChange, onDelete }) => {
  const actions = (
    <div className="flex items-center gap-2">
       <div className="flex items-center justify-center min-w-[80px] px-2.5 py-1.5 rounded-lg border transition-all bg-surface-variant dark:bg-surface-variant-dark border-outline dark:border-outline-dark">
          <input type="number" value={quantity} onChange={(e) => onChange('quantity', parseFloat(e.target.value)||0)} className="w-10 text-right bg-transparent outline-none font-bold text-primary dark:text-primary-dark text-sm" />
          <input value={unit} onChange={(e) => onChange('unit', e.target.value)} className="w-8 ml-1 bg-transparent outline-none text-content-secondary dark:text-content-secondary-dark text-xs font-mono" />
       </div>
    </div>
  );

  return (
    <BaseRow onDelete={onDelete} actions={actions}>
      <input value={name} onChange={(e) => onChange('name', e.target.value)} className="w-full text-sm font-medium bg-transparent outline-none text-content dark:text-content-dark" placeholder="Item Name" />
    </BaseRow>
  );
});

// 2. SCALER ROW (Recipe View Mode)
export const IngredientScaler: React.FC<{
  name: string;
  quantity: number;
  unit: string;
  scalingFactor: number;
  onScaleClick: () => void;
  isScaling?: boolean;
  scaleInputValue?: string;
  onScaleChange?: (val: string) => void;
  onScaleBlur?: () => void;
}> = React.memo(({ name, quantity, unit, scalingFactor, onScaleClick, isScaling, scaleInputValue, onScaleChange, onScaleBlur }) => {
  const displayQty = quantity * scalingFactor;
  
  const actions = (
    <div className="flex items-center gap-2">
      <div 
        onClick={(e) => { e.stopPropagation(); onScaleClick(); }}
        className={`flex items-center justify-center min-w-[80px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${isScaling ? 'border-primary ring-2 ring-primary/20 bg-surface dark:bg-surface-dark' : 'bg-primary-container dark:bg-primary-container-dark border-transparent'}`}
      >
        {isScaling ? (
          <>
            <input autoFocus type="number" value={scaleInputValue} onChange={(e) => onScaleChange?.(e.target.value)} onBlur={onScaleBlur} className="w-12 text-right bg-transparent outline-none font-bold text-primary dark:text-primary-dark text-sm" />
            <span className="text-content-secondary dark:text-content-secondary-dark text-xs font-mono ml-1">{unit}</span>
          </>
        ) : (
          <span className="text-xs font-bold font-mono text-primary dark:text-primary-dark">
            <CountUp value={displayQty} /> <span className="font-normal lowercase">{unit}</span>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <BaseRow actions={actions}>
      <p className="text-sm font-medium text-content dark:text-content-dark truncate">{name}</p>
    </BaseRow>
  );
});

// 3. CHECKABLE ROW (Shopping List Mode)
/**
 * @component CheckableIngredient
 * @description Renders an ingredient with a checkbox for the shopping list.
 * ⚡ Optimization: Uses an optional `id` and passes it back to `onToggle` to support stable handlers.
 */
export const CheckableIngredient: React.FC<{
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  onToggle: (id?: any) => void;
}> = React.memo(({ id, name, quantity, unit, isChecked, onToggle }) => {
  const { trigger } = useHaptics();
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout if component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Sync state if external prop changes (e.g. "Clear List" pressed)
  useEffect(() => {
    if (isChecked) setIsPending(false);
  }, [isChecked]);

  const displayChecked = isChecked || isPending;
  const displayQty = quantity;

  const handleToggle = () => {
    trigger('light');
    
    // Clear any existing timer to prevent race conditions or double toggles
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isChecked && !isPending) {
      // CASE: Checking off
      // 1. Optimistically show as checked immediately (triggers visual animations)
      setIsPending(true);
      
      // 2. Delay the actual data update (which triggers the sort/move)
      timerRef.current = setTimeout(() => {
        onToggle(id);
        // No need to setPending(false) here, the prop change or unmount handles it
      }, 800); 
    } else if (isPending) {
      // CASE: Undo during the delay window
      setIsPending(false);
      // We do NOT call onToggle, effectively cancelling the check action
    } else {
      // CASE: Unchecking an already saved item (immediate)
      onToggle(id);
    }
  };

  const leading = (
    <div 
      onClick={(e) => { e.stopPropagation(); handleToggle(); }}
      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${displayChecked ? 'bg-primary border-primary' : 'bg-surface dark:bg-surface-dark border-outline dark:border-outline-dark'}`}
    >
      {displayChecked && <Check className="w-4 h-4 text-white animate-in zoom-in duration-300" strokeWidth={3} />}
    </div>
  );

  const actions = (
    <div className={`flex items-center justify-center min-w-[80px] px-2.5 py-1.5 rounded-lg border transition-all duration-500 ${displayChecked ? 'border-outline dark:border-outline-dark opacity-40 grayscale' : 'bg-primary-container dark:bg-primary-container-dark border-transparent'}`}>
       <span className={`text-xs font-bold font-mono ${displayChecked ? 'text-content-tertiary' : 'text-primary dark:text-primary-dark'}`}>
          {Number(displayQty.toFixed(2))} <span className="font-normal lowercase">{unit}</span>
       </span>
    </div>
  );

  return (
    <BaseRow leading={leading} isChecked={displayChecked} onClick={handleToggle} actions={actions}>
      <div className="relative inline-block">
        <p className={`text-sm font-medium truncate transition-colors duration-500 ${displayChecked ? 'text-content-tertiary dark:text-content-tertiary-dark' : 'text-content dark:text-content-dark'}`}>
          {name}
        </p>
        <div className={`absolute top-1/2 left-0 h-[2px] bg-content-tertiary dark:bg-content-tertiary-dark transition-all duration-500 ease-out pointer-events-none ${displayChecked ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
      </div>
    </BaseRow>
  );
});

// 4. SIMPLE ROW (Orchestrator Mode)
export const IngredientRow: React.FC<{ name: string; quantity: number; unit: string }> = React.memo(({ name, quantity, unit }) => {
  const actions = (
    <span className="text-xs font-bold font-mono text-content-secondary dark:text-content-secondary-dark bg-surface-variant dark:bg-surface-variant-dark px-2 py-1 rounded">
      {Number(quantity.toFixed(2))} {unit}
    </span>
  );
  return <BaseRow actions={actions}><p className="text-sm font-medium text-content dark:text-content-dark">{name}</p></BaseRow>;
});

// --- EMPTY STATE ---
export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => (
  <div className={`h-full flex flex-col items-center justify-center animate-fade-in px-4 text-center ${className}`}>
    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-3xl flex items-center justify-center mb-6 shadow-sm">
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8 md:w-10 md:h-10 text-content-tertiary dark:text-content-tertiary-dark" })}
    </div>
    <h3 className="text-lg md:text-xl font-bold text-content dark:text-content-dark google-sans">{title}</h3>
    <p className="text-sm text-content-secondary dark:text-content-secondary-dark mt-2 max-w-xs leading-relaxed">{description}</p>
    {action && <div className="mt-8">{action}</div>}
  </div>
);
