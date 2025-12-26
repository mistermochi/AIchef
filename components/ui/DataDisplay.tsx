import React from 'react';
import { Check, Trash2, Plus } from 'lucide-react';

// --- EDITABLE LIST (Generic) ---

interface EditableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isEditing: boolean) => React.ReactNode;
  onAdd: () => void;
  isEditing: boolean;
  addButtonLabel?: string;
  className?: string;
}

export function EditableList<T>({ 
  items, 
  renderItem, 
  onAdd, 
  isEditing, 
  addButtonLabel = "Add Item",
  className = ''
}: EditableListProps<T>) {
  return (
    <div className={className}>
      {items.map((item, i) => renderItem(item, i, isEditing))}
      {isEditing && (
        <button 
          onClick={onAdd} 
          className="w-full py-3 bg-surface-variant dark:bg-surface-variant-dark text-primary dark:text-primary-dark text-xs font-bold uppercase hover:bg-primary-container dark:hover:bg-primary-container-dark border-t border-outline dark:border-outline-dark flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> {addButtonLabel}
        </button>
      )}
    </div>
  );
}

// --- BADGE ---

interface BadgeProps {
  label: string | number;
  icon?: React.ReactNode;
  variant?: 'primary' | 'neutral' | 'success' | 'warning';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({ label, icon, variant = 'primary', className = '', onClick }) => {
  const variants = {
    primary: "bg-primary-container dark:bg-primary-container-dark text-primary dark:text-primary-dark border-primary/20 dark:border-primary-dark/20",
    neutral: "bg-surface-variant dark:bg-surface-variant-dark text-content-secondary dark:text-content-secondary-dark border-outline dark:border-outline-dark",
    success: "bg-success-container dark:bg-success-container-dark text-success-dark dark:text-success-dark border-success/20 dark:border-success-dark/20",
    warning: "bg-warning-container dark:bg-warning-container-dark text-warning-on-container dark:text-warning-on-container-dark border-warning/20 dark:border-warning/20",
  };

  return (
    <span 
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-2xs font-bold uppercase border transition-all ${variants[variant]} ${className} ${onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''}`}
    >
      {icon && React.cloneElement(icon as React.ReactElement<any>, { className: "w-3.5 h-3.5" })}
      {label}
    </span>
  );
};

// --- LIST ROW (Standardized Step/Tip Item) ---

interface ListRowProps {
  leading: React.ReactNode;
  content: string;
  isEditing?: boolean;
  onChange?: (val: string) => void;
  onDelete?: () => void;
  placeholder?: string;
  className?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  leading, content, isEditing, onChange, onDelete, placeholder, className = ''
}) => {
  return (
    <div className={`flex group border-b border-outline/30 dark:border-outline-dark/30 last:border-none hover:bg-surface-variant/50 dark:hover:bg-surface-variant-dark/50 transition-colors ${className}`}>
      {/* Leading Column (Icon/Number) */}
      <div className="w-12 sm:w-16 shrink-0 flex flex-col items-center pt-5 bg-surface-variant/30 dark:bg-surface-variant-dark/30 border-r border-outline/30 dark:border-outline-dark/30 text-content-tertiary dark:text-content-tertiary-dark transition-colors">
        {leading}
      </div>

      {/* Content Column - Standardized to p-4 */}
      <div className="flex-1 p-4 min-w-0">
        {isEditing ? (
           <textarea
             value={content}
             onChange={(e) => onChange?.(e.target.value)}
             placeholder={placeholder}
             className="w-full bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-lg p-3 text-sm outline-none shadow-sm text-content dark:text-content-dark placeholder:text-content-tertiary dark:placeholder:text-content-tertiary-dark focus:border-primary dark:focus:border-primary-dark focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary-dark/20 transition-all resize-none block"
             rows={Math.max(2, Math.min(5, content.split('\n').length))}
           />
        ) : (
           <p className="text-sm text-content-secondary dark:text-content-secondary-dark leading-relaxed whitespace-pre-wrap transition-colors">
             {content}
           </p>
        )}
      </div>

      {/* Action Column (Delete) */}
      {isEditing && onDelete && (
        <div className="pr-3 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <button
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="p-2 text-content-tertiary dark:text-content-tertiary-dark hover:text-danger dark:hover:text-danger-dark hover:bg-danger-container dark:hover:bg-danger-container-dark rounded-lg transition-colors"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      )}
    </div>
  );
};

// --- INGREDIENT ITEM ---

interface IngredientItemProps {
  name: string;
  quantity: number;
  unit: string;
  scalingFactor?: number;
  isChecked?: boolean;
  isEditing?: boolean;
  onClick?: () => void;
  onToggle?: () => void;
  onChange?: (field: 'name' | 'quantity' | 'unit', value: any) => void;
  onDelete?: () => void;
  scalingMode?: 'display' | 'input';
  scaleInputValue?: string;
  onScaleClick?: () => void;
  onScaleChange?: (val: string) => void;
  onScaleBlur?: () => void;
}

export const IngredientItem: React.FC<IngredientItemProps> = ({
  name, quantity, unit,
  scalingFactor = 1, isChecked, isEditing,
  onClick, onToggle, onChange, onDelete,
  scalingMode = 'display', scaleInputValue, onScaleClick, onScaleChange, onScaleBlur
}) => {
  const displayQty = Number((quantity * scalingFactor).toFixed(2));
  
  // Standardized padding to p-4
  const containerClass = `
    flex items-center gap-4 p-4 transition-all group border-b border-outline/30 dark:border-outline-dark/30 last:border-0
    ${isChecked ? 'bg-surface-variant/50 dark:bg-surface-variant-dark/30' : 'hover:bg-surface-variant/50 dark:hover:bg-surface-variant-dark/50'}
    ${onClick ? 'cursor-pointer' : ''}
  `;

  return (
    <div className={containerClass} onClick={onClick}>
      {(onToggle || isChecked !== undefined) && (
        <div 
          onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
            isChecked 
              ? 'bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark' 
              : 'bg-surface dark:bg-transparent border-outline dark:border-outline-dark'
          }`}
        >
          {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {isEditing ? (
           <input 
             value={name} 
             onChange={(e) => onChange?.('name', e.target.value)}
             className="w-full text-sm font-medium bg-transparent outline-none text-content dark:text-content-dark placeholder:text-content-tertiary"
             placeholder="Item Name"
             onClick={(e) => e.stopPropagation()}
           />
        ) : (
           <p className={`text-sm font-medium truncate transition-colors ${isChecked ? 'text-content-tertiary dark:text-content-tertiary-dark line-through' : 'text-content dark:text-content-dark'}`}>
             {name}
           </p>
        )}
      </div>
      <div className="flex items-center gap-2">
         <div 
           onClick={(e) => {
             if (onScaleClick && !isEditing) {
               e.stopPropagation();
               onScaleClick();
             }
           }}
           className={`
             flex items-center justify-center min-w-[70px] px-2.5 py-1.5 rounded-lg border transition-all
             ${isEditing 
                ? 'bg-surface-variant dark:bg-surface-variant-dark border-outline dark:border-outline-dark' 
                : scalingMode === 'input' 
                  ? 'bg-surface-variant dark:bg-surface-variant-dark border-primary dark:border-primary-dark ring-2 ring-primary/20' 
                  : isChecked
                    ? 'bg-transparent border-outline dark:border-outline-dark'
                    : 'bg-primary-container dark:bg-primary-container-dark border-transparent dark:border-outline-dark cursor-pointer hover:bg-primary-container/80'
             }
           `}
         >
            {isEditing ? (
              <>
                <input 
                  type="number" 
                  value={quantity || ''} 
                  onChange={(e) => onChange?.('quantity', parseFloat(e.target.value) || 0)}
                  className="w-10 text-right bg-transparent outline-none font-bold text-primary dark:text-primary-dark text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <input 
                  value={unit} 
                  onChange={(e) => onChange?.('unit', e.target.value)}
                  className="w-8 ml-1 bg-transparent outline-none text-content-secondary dark:text-content-secondary-dark text-xs font-mono"
                  onClick={(e) => e.stopPropagation()}
                />
              </>
            ) : scalingMode === 'input' ? (
              <>
                 <input 
                   autoFocus
                   type="number"
                   value={scaleInputValue}
                   onChange={(e) => onScaleChange?.(e.target.value)}
                   onBlur={onScaleBlur}
                   onKeyDown={(e) => e.key === 'Enter' && onScaleBlur?.()}
                   className="w-12 text-right bg-transparent outline-none font-bold text-primary dark:text-primary-dark text-sm"
                   onClick={(e) => e.stopPropagation()}
                 />
                 <span className="text-content-secondary dark:text-content-secondary-dark text-xs font-mono ml-1">{unit}</span>
              </>
            ) : (
               <span className={`text-xs font-bold font-mono whitespace-nowrap ${isChecked ? 'text-content-tertiary dark:text-content-tertiary-dark' : 'text-primary dark:text-primary-dark'}`}>
                 {displayQty} <span className={`font-normal lowercase ${isChecked ? '' : 'text-content-secondary dark:text-content-secondary-dark'}`}>{unit}</span>
               </span>
            )}
         </div>
         {isEditing && onDelete && (
           <button 
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
             className="p-1.5 text-content-tertiary dark:text-content-tertiary-dark hover:text-danger dark:hover:text-danger-dark transition-colors"
           >
             <Trash2 className="w-4 h-4" />
           </button>
         )}
      </div>
    </div>
  );
};

// --- EMPTY STATE ---

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => {
  return (
    <div className={`h-full flex flex-col items-center justify-center animate-fade-in px-4 text-center ${className}`}>
      <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-8 h-8 md:w-10 md:h-10 text-content-tertiary dark:text-content-tertiary-dark" })}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-content dark:text-content-dark google-sans">{title}</h3>
      <p className="text-sm text-content-secondary dark:text-content-secondary-dark mt-2 max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
};
