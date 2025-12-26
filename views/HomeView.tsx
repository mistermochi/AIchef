
import React from 'react';
import { Sparkles, Loader2, Terminal, Info, Zap } from 'lucide-react';

interface HomeViewProps {
  recipeInput: string;
  setRecipeInput: (val: string) => void;
  processRecipeAction: () => void;
  loading: boolean;
  error: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  recipeInput, setRecipeInput, processRecipeAction, loading, error
}) => {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-5xl mx-auto pb-20 md:pb-6">
      
      {/* Main Prompt Box */}
      <div className="flex-1 flex flex-col studio-card bg-white dark:bg-[#1b1b1b] overflow-hidden shadow-md border-[#dadce0] dark:border-[#3c4043] relative min-h-[300px] transition-colors">
        <div className="h-9 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center px-4 bg-[#f8f9fa] dark:bg-[#0f1114] shrink-0 justify-between transition-colors">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">
            <Terminal className="w-3 h-3 text-[#0b57d0] dark:text-[#8ab4f8]" />
            <span>Recipe Prompt</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#2d2e30] px-2 py-0.5 rounded uppercase">
            <Zap className="w-2.5 h-2.5" />
            <span>Gemini 3 Flash</span>
          </div>
        </div>

        <div className="flex-1 relative flex flex-col">
          <textarea 
            className="flex-1 w-full p-5 text-[15px] outline-none resize-none placeholder:text-[#bdc1c6] dark:placeholder:text-[#5f6368] font-normal leading-relaxed text-[#1f1f1f] dark:text-[#e3e3e3] bg-transparent"
            placeholder="Paste a recipe URL, ingredients, or a cooking method to adapt..."
            value={recipeInput}
            onChange={(e) => setRecipeInput(e.target.value)}
          />
        </div>

        {/* Action Bar */}
        <div className="h-14 border-t border-[#dadce0] dark:border-[#3c4043] bg-[#f8f9fa] dark:bg-[#0f1114] flex items-center justify-between px-4 shrink-0 transition-colors">
          <div className="flex-1 min-w-0 mr-3">
            {error ? (
              <div className="text-[10px] text-[#ba1a1a] dark:text-[#ffb4ab] font-bold uppercase flex items-center gap-1.5 truncate">
                <Info className="w-3 h-3" />
                {error}
              </div>
            ) : (
              <p className="text-[10px] text-[#8e918f] dark:text-[#5f6368] font-medium hidden sm:block">
                Enter your recipe details to begin the AI adaptation process.
              </p>
            )}
          </div>
          
          <button 
            onClick={processRecipeAction}
            disabled={loading || !recipeInput.trim()}
            className="bg-[#0b57d0] dark:bg-[#0b57d0] text-white rounded-xl px-5 h-9 font-bold text-[12px] flex items-center gap-2 hover:bg-[#0842a0] dark:hover:bg-[#0842a0] transition-all disabled:bg-[#f1f3f4] dark:disabled:bg-[#2d2e30] disabled:text-[#bdc1c6] dark:disabled:text-[#5f6368] shadow-sm active:scale-95 shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? 'Running...' : 'Run Adapter'}
          </button>
        </div>
      </div>

      {/* Tip Box */}
      <div className="mt-4 p-3 bg-white/60 dark:bg-[#1b1b1b]/40 rounded-xl border border-dashed border-[#dadce0] dark:border-[#3c4043] flex items-center gap-3 transition-colors">
        <div className="w-7 h-7 rounded-full bg-[#f1f3f4] dark:bg-[#2d2e30] flex items-center justify-center shrink-0">
          <Info className="w-3.5 h-3.5 text-[#8e918f] dark:text-[#5f6368]" />
        </div>
        <p className="text-[10px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed">
          <strong>Smart Tip:</strong> The model automatically identifies ingredients and steps to scale them precisely to your preference.
        </p>
      </div>
    </div>
  );
};
