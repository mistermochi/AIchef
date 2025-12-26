import React from 'react';
import { ChefHat, Trash2, Plus } from 'lucide-react';
import { Recipe } from '../types';

interface InstructionsSectionProps {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  isEditing: boolean;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({ recipe, setRecipe, isEditing }) => {
  const updateStep = (idx: number, val: string) => {
    const updated = [...recipe.instructions];
    updated[idx] = val;
    setRecipe(p => p ? ({ ...p, instructions: updated }) : null);
  };
  const removeStep = (idx: number) => setRecipe(p => p ? ({ ...p, instructions: p.instructions.filter((_, i) => i !== idx) }) : null);
  const addStep = () => setRecipe(p => p ? ({ ...p, instructions: [...p.instructions, ''] }) : null);

  return (
    <div className="studio-card bg-white dark:bg-[#1b1b1b] overflow-hidden border-[#dadce0] dark:border-[#3c4043] transition-colors">
      <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between px-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] shrink-0 rounded-t-xl">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">
          <ChefHat className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#8ab4f8]" />
          <span>Steps</span>
        </div>
      </div>
      <div className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
        {recipe.instructions.map((step, i) => (
          <div key={i} className="flex group last:border-none hover:bg-[#fcfdfe] dark:hover:bg-[#2d2e30] transition-colors">
            <div className="w-12 sm:w-16 shrink-0 flex flex-col items-center pt-6 bg-[#f8f9fa] dark:bg-[#0f1114] border-r border-[#f1f3f4] dark:border-[#3c4043] transition-colors">
              <span className="text-[11px] font-mono font-bold text-[#bdc1c6] dark:text-[#5f6368]">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="flex-1 p-5 sm:p-6 min-w-0">
              {isEditing ? (
                <textarea value={step} onChange={e => updateStep(i, e.target.value)} className="w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg p-4 text-[13px] outline-none shadow-inner text-[#1f1f1f] dark:text-white" rows={3} />
              ) : <p className="text-[14px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed transition-colors">{step}</p>}
            </div>
            {isEditing && (
              <div className="pr-4 pt-6">
                <button onClick={() => removeStep(i)} className="text-[#bdc1c6] dark:text-[#5f6368] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] p-2 rounded-lg hover:bg-[#ffdad6] dark:hover:bg-red-900/20 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
        {isEditing && <button onClick={addStep} className="w-full py-5 bg-[#f8f9fa] dark:bg-[#0f1114] border-t border-[#dadce0] dark:border-[#3c4043] text-[#0b57d0] dark:text-[#8ab4f8] text-[11px] font-bold uppercase hover:bg-[#e8f0fe] dark:hover:bg-[#2d2e30] transition-all flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Insert Task Block</button>}
      </div>
    </div>
  );
};