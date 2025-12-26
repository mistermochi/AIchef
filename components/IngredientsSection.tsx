import React, { useState } from 'react';
import { ShoppingBasket, Scale, ArrowRightLeft, Trash2, Plus } from 'lucide-react';
import { Recipe } from '../types';

interface IngredientsSectionProps {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  isEditing: boolean;
  scalingFactor: number;
  setScalingFactor: (v: number) => void;
}

const formatQty = (num: number) => Number(num.toFixed(2));

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({ recipe, setRecipe, isEditing, scalingFactor, setScalingFactor }) => {
  const [activeScaleIndex, setActiveScaleIndex] = useState<number | null>(null);
  const [tempScaleValue, setTempScaleValue] = useState<string>('');

  const updateIng = (idx: number, field: string, val: any) => {
    const updated = [...recipe.ingredients];
    updated[idx] = { ...updated[idx], [field]: val };
    setRecipe(p => p ? ({ ...p, ingredients: updated }) : null);
  };

  const handleProportionalScale = (idx: number, newVal: string) => {
    setTempScaleValue(newVal);
    const originalQty = recipe.ingredients[idx].quantity;
    const parsedVal = parseFloat(newVal);
    if (!isNaN(parsedVal) && originalQty > 0) setScalingFactor(parsedVal / originalQty);
  };

  const removeIng = (idx: number) => setRecipe(p => p ? ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }) : null);
  const addIng = () => setRecipe(p => p ? ({ ...p, ingredients: [...p.ingredients, { name: '', quantity: 1, unit: 'g' }] }) : null);

  return (
    <div className="studio-card bg-white dark:bg-[#1b1b1b] overflow-hidden border-[#dadce0] dark:border-[#3c4043] transition-colors">
      <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between px-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">
          <ShoppingBasket className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#8ab4f8]" />
          <span>Ingredients</span>
        </div>
        {!isEditing && <div className="flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#2d2e30] px-3 py-1 rounded-lg text-[10px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] border border-[#d2e3fc] dark:border-[#3c4043]"><Scale className="w-3.5 h-3.5" /> {formatQty(scalingFactor)}x</div>}
      </div>
      {!isEditing && (
        <div className="px-5 py-2 bg-[#f8f9fa] dark:bg-[#0f1114] border-b border-[#dadce0] dark:border-[#3c4043] flex items-center gap-2 transition-colors">
          <ArrowRightLeft className="w-3 h-3 text-[#0b57d0] dark:text-[#8ab4f8]" />
          <span className="text-[10px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-tight">Click quantity to scale</span>
        </div>
      )}
      <div className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
        {recipe.ingredients.map((ing, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[#f8f9fa] dark:hover:bg-[#2d2e30] transition-colors group">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                 <input value={ing.name} onChange={e => updateIng(idx, 'name', e.target.value)} className="w-full text-[14px] font-medium bg-transparent outline-none text-[#1f1f1f] dark:text-[#e3e3e3]" placeholder="Item Name" />
              ) : <span className="text-[14px] font-medium text-[#1f1f1f] dark:text-[#e3e3e3] truncate">{ing.name}</span>}
            </div>
            <div className="flex items-center gap-2">
              <div onClick={() => !isEditing && (setActiveScaleIndex(idx), setTempScaleValue(formatQty(ing.quantity * scalingFactor).toString()))} className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 transition-all min-w-[70px] justify-center ${isEditing ? 'bg-[#f8f9fa] dark:bg-[#0f1114] border-[#dadce0]' : 'bg-[#e8f0fe] dark:bg-[#2d2e30] cursor-pointer'}`}>
                {isEditing ? (
                  <><input type="number" value={ing.quantity} onChange={e => updateIng(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-10 text-right bg-transparent outline-none font-bold text-[#0b57d0] dark:text-[#8ab4f8] text-[13px]" /><input value={ing.unit} onChange={e => updateIng(idx, 'unit', e.target.value)} className="w-8 bg-transparent outline-none text-[#444746] dark:text-[#8e918f] text-[11px] font-mono" /></>
                ) : activeScaleIndex === idx ? (
                  <><input autoFocus type="number" value={tempScaleValue} onChange={e => handleProportionalScale(idx, e.target.value)} onBlur={() => setActiveScaleIndex(null)} className="w-12 text-right bg-transparent outline-none font-bold text-[#0b57d0] dark:text-[#8ab4f8] text-[13px]" /><span className="text-[#8e918f] text-[11px] font-mono">{ing.unit}</span></>
                ) : <span className="text-[13px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] font-mono whitespace-nowrap">{formatQty(ing.quantity * scalingFactor)} <span className="text-[#8e918f] dark:text-[#5f6368] font-normal lowercase">{ing.unit}</span></span>}
              </div>
              {isEditing && <button onClick={() => removeIng(idx)} className="text-[#bdc1c6] dark:text-[#5f6368] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] p-1.5"><Trash2 className="w-4 h-4" /></button>}
            </div>
          </div>
        ))}
      </div>
      {isEditing && <button onClick={addIng} className="w-full py-3 bg-[#f8f9fa] dark:bg-[#0f1114] text-[#0b57d0] dark:text-[#8ab4f8] text-[11px] font-bold uppercase hover:bg-[#e8f0fe] dark:hover:bg-[#2d2e30] border-t border-[#dadce0] dark:border-[#3c4043] flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Line Item</button>}
    </div>
  );
};