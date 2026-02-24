
import React, { useState } from 'react';
import { Tag, DollarSign, Scale, Layers, Trash2, MessageSquare, ChevronDown, Check } from 'lucide-react';
import { Input, Button } from '../../../shared/ui';
import { CATEGORIES, CATEGORY_EMOJIS, UNITS } from '../../../shared/config/app';
import { LineItem } from './types';
import { Product } from '../../../entities/tracker/model/types';

interface TrackerLogItemProps {
  item: LineItem;
  products?: Product[];
  onUpdate: (updates: Partial<LineItem>) => void;
  onDelete?: () => void;
  isLast?: boolean;
  hideDelete?: boolean;
}

export const TrackerLogItem: React.FC<TrackerLogItemProps> = React.memo(({ 
  item, 
  products = [], 
  onUpdate, 
  onDelete, 
  isLast,
  hideDelete = false
}) => {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNameChange = (val: string) => {
    onUpdate({ name: val });
    if (val.trim().length > 1 && products.length > 0) {
      const lowerVal = val.toLowerCase();
      const matches = products
        .filter(p => p.name.toLowerCase().includes(lowerVal))
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(lowerVal);
          const bStarts = b.name.toLowerCase().startsWith(lowerVal);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 6);
      
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectProduct = (p: Product) => {
    onUpdate({ 
      name: p.name, 
      genericName: p.genericName,
      category: p.category || item.category,
      unit: p.defaultUnit || item.unit 
    });
    setShowSuggestions(false);
  };

  return (
    <div className={`p-4 md:p-6 group hover:bg-primary-container/5 dark:hover:bg-primary-container-dark/5 transition-colors ${!isLast ? 'border-b border-outline/30 dark:border-outline-dark/30' : ''}`}>
      {/* Lightweight Backdrop for closing suggestions */}
      {showSuggestions && (
        <div className="fixed inset-0 z-[50] cursor-default" onClick={() => setShowSuggestions(false)} />
      )}

      <div className="flex flex-col gap-5">
        {/* Top Row: Name and Category */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className={`flex-1 relative ${showSuggestions ? 'z-[60]' : ''}`}>
            <label className="text-2xs font-bold text-content-tertiary uppercase px-1 tracking-widest mb-1.5 block">Product Name</label>
            <Input 
              placeholder="e.g. Organic Whole Milk" 
              value={item.name} 
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => item.name && handleNameChange(item.name)}
              className="font-bold text-base !bg-transparent sm:!bg-surface sm:dark:!bg-surface-dark"
              startIcon={<Tag className="text-primary/60" />}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-[100] bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-xl mt-1 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                 <div className="px-3 py-2 bg-surface-variant dark:bg-surface-variant-dark text-[10px] font-bold text-content-tertiary uppercase tracking-tighter border-b border-outline/10">Suggestions</div>
                 <div className="max-h-60 overflow-y-auto custom-scrollbar">
                   {suggestions.map(p => (
                      <button 
                        key={p.id}
                        type="button"
                        onClick={() => selectProduct(p)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-primary/5 dark:hover:bg-primary-dark/5 transition-colors flex items-center justify-between group border-b border-outline/5 last:border-none"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{CATEGORY_EMOJIS[p.category] || '📦'}</span>
                          <span className="font-medium text-content dark:text-content-dark">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-content-tertiary uppercase group-hover:text-primary transition-colors">{p.category}</span>
                           <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                   ))}
                 </div>
              </div>
            )}
          </div>

          <div className="sm:w-56">
            <label className="text-2xs font-bold text-content-tertiary uppercase px-1 tracking-widest mb-1.5 block">Category</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none z-10">
                 <span className="text-sm">{CATEGORY_EMOJIS[item.category] || '🏷️'}</span>
              </div>
              <select 
                value={item.category} 
                onChange={(e) => onUpdate({ category: e.target.value })}
                className="w-full bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-xl h-10 pl-10 pr-8 text-sm font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-all"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Pricing & Quantity Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-1">
            <label className="text-2xs font-bold text-content-tertiary uppercase px-1 tracking-widest mb-1.5 block">Total Price</label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={item.price} 
              onChange={(e) => onUpdate({ price: e.target.value })} 
              className="text-primary font-bold" 
              startIcon={<DollarSign className="text-primary/60" />}
            />
          </div>
          
          <div className="col-span-1 flex flex-col">
            <label className="text-2xs font-bold text-content-tertiary uppercase px-1 tracking-widest mb-1.5 block">Item Size</label>
            <div className="flex gap-1">
              <Input type="number" placeholder="Size" value={item.singleQty} onChange={(e) => onUpdate({ singleQty: e.target.value })} className="text-center font-medium" startIcon={<Scale className="text-content-tertiary/60" />} />
              <div className="w-24 relative shrink-0">
                 <select value={item.unit} onChange={(e) => onUpdate({ unit: e.target.value })} className="w-full bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-xl h-10 px-3 text-xs font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-content-tertiary pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <label className="text-2xs font-bold text-content-tertiary uppercase px-1 tracking-widest mb-1.5 block">Quantity</label>
            <Input type="number" placeholder="Qty" value={item.count} onChange={(e) => onUpdate({ count: e.target.value })} className="text-center font-medium" startIcon={<Layers className="text-content-tertiary/60" />} />
          </div>

          {!hideDelete && (
            <div className="hidden md:flex col-span-1 items-end justify-end pb-0.5">
               <Button variant="ghost" size="sm" className="text-content-tertiary hover:text-danger hover:bg-danger-container/20 w-full justify-center" onClick={onDelete} icon={<Trash2 className="w-4 h-4" />} label="Remove Item" />
            </div>
          )}
        </div>

        {/* Notes & Mobile Delete */}
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent focus-within:border-outline transition-all">
            <MessageSquare className="w-3.5 h-3.5 text-content-tertiary/60" />
            <input 
              placeholder="Add discount info or extra details..." 
              value={item.comment} 
              onChange={(e) => onUpdate({ comment: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none text-xs text-content-secondary dark:text-content-secondary-dark italic placeholder:text-content-tertiary/50"
            />
          </div>
          {!hideDelete && (
            <div className="md:hidden">
              <Button size="icon-sm" variant="danger" onClick={onDelete} icon={<Trash2 />} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
