import React from 'react';
import { Info, Sparkles, Trash2, Send, Loader2, AlertCircle } from 'lucide-react';
import { Recipe } from '../types';

interface TipsSectionProps {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  isEditing: boolean;
  refining: boolean;
  refinePrompt: string;
  setRefinePrompt: (v: string) => void;
  onRefine: () => void;
  refineError?: string;
}

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center px-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] shrink-0 rounded-t-xl">
    <div className="flex items-center gap-2 text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">
      <Icon className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#8ab4f8]" />
      <span>{title}</span>
    </div>
  </div>
);

export const TipsSection: React.FC<TipsSectionProps> = ({ recipe, setRecipe, isEditing, refining, refinePrompt, setRefinePrompt, onRefine, refineError }) => {
  const updateTip = (idx: number, val: string) => {
    const updated = [...(recipe.extractedTips || [])];
    updated[idx] = val;
    setRecipe(p => p ? ({ ...p, extractedTips: updated }) : null);
  };
  const removeTip = (idx: number) => setRecipe(p => p ? ({ ...p, extractedTips: p.extractedTips.filter((_, i) => i !== idx) }) : null);

  return (
    <div className="space-y-6">
      {(isEditing || (recipe.extractedTips && recipe.extractedTips.length > 0)) && (
        <div className="studio-card bg-white dark:bg-[#1b1b1b] overflow-hidden border-[#dadce0] dark:border-[#3c4043] transition-colors">
          <SectionHeader icon={Info} title="Tips" />
          <div className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
            {(recipe.extractedTips || []).map((tip, idx) => (
              <div key={idx} className="flex group hover:bg-[#fcfdfe] dark:hover:bg-[#2d2e30] transition-colors items-start">
                <div className="w-12 sm:w-16 shrink-0 flex flex-col items-center pt-5 bg-[#f8f9fa] dark:bg-[#0f1114] border-r border-[#f1f3f4] dark:border-[#3c4043] h-full self-stretch">
                   <Info className="w-4 h-4 text-[#bdc1c6] dark:text-[#5f6368]" />
                </div>
                <div className="flex-1 p-5 min-w-0">
                  {isEditing ? (
                    <textarea value={tip} onChange={e => updateTip(idx, e.target.value)} className="w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg p-3 text-[13px] outline-none shadow-inner text-[#1f1f1f] dark:text-white" rows={2} />
                  ) : <p className="text-[13px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed transition-colors">{tip}</p>}
                </div>
                {isEditing && (
                  <div className="pr-4 pt-5">
                    <button onClick={() => removeTip(idx)} className="text-[#bdc1c6] dark:text-[#5f6368] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] p-1.5 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="studio-card bg-white dark:bg-[#1b1b1b] overflow-hidden border-[#dadce0] dark:border-[#3c4043] transition-colors">
        <SectionHeader icon={Sparkles} title="AI tips" />
        <div className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
          {(recipe.aiSuggestions || []).map((tip, idx) => (
            <div key={idx} className="flex group hover:bg-[#fcfdfe] dark:hover:bg-[#2d2e30] transition-colors items-start">
              <div className="w-12 sm:w-16 shrink-0 flex flex-col items-center pt-5 border-r border-[#f1f3f4] dark:border-[#3c4043] h-full self-stretch">
                 <Sparkles className="w-4 h-4 text-[#0b57d0] dark:text-[#8ab4f8]" />
              </div>
              <div className="flex-1 p-5 min-w-0">
                 <p className="text-[13px] text-[#1f1f1f] dark:text-[#e3e3e3] leading-relaxed transition-colors">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isEditing && (
        <div className="space-y-2">
           {refineError && <div className="flex items-center gap-2 text-[10px] text-[#ba1a1a] dark:text-[#ffb4ab] font-bold uppercase px-1"><AlertCircle className="w-3 h-3" />{refineError}</div>}
           <div className="relative group">
              <textarea value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onRefine())} placeholder="Ask AI for new tips" className="w-full bg-white dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] rounded-xl px-5 py-4 pr-14 text-[13px] outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] shadow-sm resize-none h-[60px] dark:text-white" />
              <button onClick={onRefine} disabled={refining || !refinePrompt.trim()} className="absolute right-2.5 top-2.5 p-2 bg-[#0b57d0] text-white rounded-lg disabled:opacity-30 active:scale-90 transition-all">
                {refining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};