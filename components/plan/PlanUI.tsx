
import React from 'react';
import { Plus, Trash2, Minus, Users, Play, Clock, Check } from 'lucide-react';
import { MealPlanEntry, MealSlot } from '../../types';
import { BaseCard, Button } from '../UI';

export const MealCard: React.FC<{ 
    entry: MealPlanEntry; 
    onClick: () => void;
}> = ({ entry, onClick }) => {
    return (
        <BaseCard 
            noPadding 
            className="h-24 relative group cursor-pointer hover:ring-2 hover:ring-primary/50 dark:hover:ring-primary-dark/50 transition-all active:scale-[0.98] shrink-0"
            onClick={onClick}
        >
             <div className="flex h-full">
                 <div className="w-1.5 bg-primary/20 dark:bg-primary-dark/20 h-full"></div>
                 <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="text-xl">{entry.emoji || '🥘'}</div>
                    </div>
                    <div className="text-xs font-bold text-content dark:text-content-dark line-clamp-2 leading-tight">
                        {entry.customTitle || 'Unknown Recipe'}
                    </div>
                    {entry.servings > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-content-tertiary font-medium">
                            <Users className="w-3 h-3" />
                            <span>{entry.servings}</span>
                        </div>
                    )}
                 </div>
             </div>
        </BaseCard>
    );
};

export const AddMealButton: React.FC<{
    onClick: () => void;
    compact?: boolean;
}> = ({ onClick, compact }) => {
    return (
        <button 
            onClick={onClick}
            className={`w-full border-2 border-dashed border-outline/50 dark:border-outline-dark/30 rounded-xl flex items-center justify-center text-content-tertiary hover:text-primary hover:border-primary/50 hover:bg-surface-variant/30 transition-all group shrink-0 ${compact ? 'h-10' : 'h-24'}`}
            title="Add Recipe"
        >
            <Plus className={`opacity-50 group-hover:opacity-100 ${compact ? 'w-4 h-4' : 'w-6 h-6'}`} />
        </button>
    );
};

export const EmptySlotPill: React.FC<{
    slot: string;
    onClick: () => void;
}> = ({ slot, onClick }) => (
    <button
        onClick={onClick}
        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-outline dark:border-outline-dark hover:border-primary dark:hover:border-primary-dark bg-surface-variant/30 dark:bg-surface-variant-dark/30 hover:bg-surface-variant dark:hover:bg-surface-variant-dark text-xs font-medium text-content-secondary dark:text-content-secondary-dark transition-all active:scale-95"
    >
        <Plus className="w-3.5 h-3.5 opacity-60" />
        <span className="capitalize">{slot}</span>
    </button>
);

const SLOT_ORDER: MealSlot[] = ['breakfast', 'lunch', 'tea', 'dinner'];
const SLOT_EMOJIS: Record<MealSlot, string> = { 
    breakfast: '🌅', 
    lunch: '☀️', 
    tea: '☕', 
    dinner: '🌙' 
};
const SLOT_LABELS: Record<MealSlot, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    tea: 'Tea Time',
    dinner: 'Dinner'
};

export const PlanConfigForm: React.FC<{
    title: string;
    emoji: string;
    slot: MealSlot;
    servings: number;
    onSlotChange: (s: MealSlot) => void;
    onServingsChange: (n: number) => void;
    onSubmit: () => void;
    submitLabel?: string;
    onDelete?: () => void;
    onOpenRecipe?: () => void;
}> = ({ title, emoji, slot, servings, onSlotChange, onServingsChange, onSubmit, submitLabel = "Save", onDelete, onOpenRecipe }) => {
    return (
        <div className="space-y-6 py-2">
            
            {/* Recipe Preview */}
            <div className="flex items-center gap-4 p-4 bg-surface-variant dark:bg-surface-variant-dark rounded-2xl border border-outline/50 dark:border-outline-dark/50">
               <div className="w-16 h-16 rounded-xl bg-surface dark:bg-surface-dark flex items-center justify-center text-4xl shadow-sm">
                  {emoji}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg text-content dark:text-content-dark leading-tight truncate">{title}</div>
                  <div className="text-xs text-content-secondary dark:text-content-secondary-dark mt-1">Ready to plan</div>
               </div>
               {onOpenRecipe && (
                   <button onClick={onOpenRecipe} className="p-3 bg-surface dark:bg-surface-dark rounded-xl text-primary dark:text-primary-dark hover:bg-primary-container/20 transition-colors" title="Open Recipe">
                       <Play className="w-5 h-5" />
                   </button>
               )}
            </div>

            {/* Time Selector */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-primary dark:text-primary-dark" />
                  <span className="text-xs font-bold uppercase tracking-widest text-content-tertiary">Meal Time</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SLOT_ORDER.map(s => {
                      const isSelected = slot === s;
                      return (
                          <button
                              key={s}
                              onClick={() => onSlotChange(s)}
                              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all border ${
                                  isSelected 
                                      ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' 
                                      : 'bg-surface dark:bg-surface-dark border-outline dark:border-outline-dark text-content-secondary dark:text-content-secondary-dark hover:border-primary/50'
                              }`}
                          >
                              <span className="text-xl">{SLOT_EMOJIS[s]}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-white' : ''}`}>
                                  {SLOT_LABELS[s]}
                              </span>
                          </button>
                      );
                  })}
              </div>
            </div>

            {/* Servings Selector */}
            <div>
               <div className="flex items-center gap-2 mb-3">
                  <Users className="w-3.5 h-3.5 text-primary dark:text-primary-dark" />
                  <span className="text-xs font-bold uppercase tracking-widest text-content-tertiary">Servings</span>
               </div>
               <div className="flex items-center justify-between p-2 pl-4 bg-surface-variant dark:bg-surface-variant-dark rounded-xl border border-outline dark:border-outline-dark">
                  <span className="text-sm font-medium text-content-secondary dark:text-content-secondary-dark">Number of people</span>
                  <div className="flex items-center gap-3">
                      <button 
                          onClick={() => onServingsChange(Math.max(1, servings - 1))}
                          className="w-10 h-10 flex items-center justify-center bg-surface dark:bg-surface-dark rounded-lg shadow-sm hover:bg-primary-container dark:hover:bg-primary-container-dark transition-colors"
                      >
                          <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-bold font-mono w-8 text-center">{servings}</span>
                      <button 
                          onClick={() => onServingsChange(servings + 1)}
                          className="w-10 h-10 flex items-center justify-center bg-surface dark:bg-surface-dark rounded-lg shadow-sm hover:bg-primary-container dark:hover:bg-primary-container-dark transition-colors"
                      >
                          <Plus className="w-4 h-4" />
                      </button>
                  </div>
               </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col gap-3">
                <Button 
                  fullWidth 
                  size="lg" 
                  onClick={onSubmit} 
                  icon={<Check className="w-5 h-5" />}
                >
                  {submitLabel}
                </Button>
                
                {onDelete && (
                    <button 
                        onClick={onDelete}
                        className="w-full py-3 text-danger text-sm font-bold hover:bg-danger-container/10 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Remove from Plan
                    </button>
                )}
            </div>
        </div>
    );
};
