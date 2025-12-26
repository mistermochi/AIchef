
import React, { useRef, useEffect } from 'react';
import { Wand2, Loader2, Sparkles, ChevronRight, CookingPot, Zap, Mic, Plus, ArrowUp } from 'lucide-react';
import { GenieIdea } from '../types';

interface GenieViewProps {
  genieInput: string;
  setGenieInput: (val: string) => void;
  genieIdeas: GenieIdea[];
  genieLoading: boolean;
  generateGenieIdeasAction: () => void;
  selectGenieIdea: (idea: GenieIdea) => void;
  loadingRecipe: boolean;
  error: string;
}

export const GenieView: React.FC<GenieViewProps> = ({
  genieInput, setGenieInput, genieIdeas, genieLoading,
  generateGenieIdeasAction, selectGenieIdea, loadingRecipe, error
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new ideas arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [genieIdeas]);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto relative animate-in fade-in duration-500">
      
      {/* Header Info - Consistent with HomeView */}
      <div className="px-2 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans">Kitchen Genie</h2>
          <p className="text-[11px] text-[#444746] dark:text-[#c4c7c5] font-medium uppercase tracking-tighter">AI Ideation Assistant</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#2d2e30] px-2.5 py-1 rounded-lg border border-[#d2e3fc] dark:border-[#3c4043] uppercase transition-colors">
          < Zap className="w-3 h-3" />
          <span>Creative Mode</span>
        </div>
      </div>

      {/* Center Section: Ideas Stream */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-4 pb-48 pt-2"
      >
        {genieIdeas.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-widest px-1 mb-4">
              <Sparkles className="w-3 h-3 text-[#0b57d0] dark:text-[#8ab4f8]" />
              <span>Conveyed Recommendations</span>
            </div>
            
            {genieIdeas.map((idea, idx) => (
              <button 
                key={idx}
                onClick={() => selectGenieIdea(idea)}
                disabled={loadingRecipe}
                className="w-full text-left p-4 rounded-xl bg-white dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] hover:border-[#0b57d0] dark:hover:border-[#8ab4f8] hover:bg-[#f8f9fa] dark:hover:bg-[#2d2e30] transition-all group flex gap-4 animate-in slide-in-from-bottom-2 duration-300 relative"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="w-12 h-12 bg-[#f8f9fa] dark:bg-[#0f1114] rounded-lg border border-[#dadce0] dark:border-[#3c4043] flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  {idea.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-bold text-[#1f1f1f] dark:text-[#e3e3e3] group-hover:text-[#0b57d0] dark:group-hover:text-[#8ab4f8] transition-colors mb-0.5 truncate">{idea.title}</h4>
                  <p className="text-[12px] text-[#444746] dark:text-[#c4c7c5] line-clamp-2 leading-relaxed italic opacity-80">{idea.summary}</p>
                </div>
                <div className="self-center">
                  {loadingRecipe ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0b57d0] dark:text-[#8ab4f8]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#bdc1c6] dark:text-[#5f6368] group-hover:text-[#0b57d0] dark:group-hover:text-[#8ab4f8] group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-10 px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] rounded-3xl flex items-center justify-center mb-6 shadow-sm transition-colors">
              <CookingPot className="w-8 h-8 md:w-10 md:h-10 text-[#bdc1c6] dark:text-[#5f6368]" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans transition-colors tracking-tight">Pantry brainstorming</h3>
            <p className="text-[13px] text-[#444746] dark:text-[#c4c7c5] mt-2 max-w-xs text-center leading-relaxed transition-colors">
              List the ingredients you have available in the prompt below, and the Genie will conjure creative recipe concepts for your workspace.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Section: Fixed Prompt Bar */}
      <div className="absolute bottom-16 md:bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-[#f8f9fa] dark:from-[#0f1114] via-[#f8f9fa] dark:via-[#0f1114] to-transparent z-20 transition-all duration-300">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          
          {error && (
            <p className="text-[10px] text-[#ba1a1a] dark:text-[#ffb4ab] font-bold uppercase text-center animate-pulse">
              {error}
            </p>
          )}

          <div className="bg-white dark:bg-[#1b1b1b] rounded-xl border border-[#dadce0] dark:border-[#3c4043] p-4 flex flex-col gap-2 transition-all focus-within:border-[#0b57d0] dark:focus-within:border-[#8ab4f8] focus-within:ring-1 focus-within:ring-[#0b57d0]/10 dark:focus-within:ring-[#8ab4f8]/10 group shadow-lg">
            <textarea 
              className="w-full bg-transparent border-none outline-none resize-none text-[15px] text-[#1f1f1f] dark:text-[#e3e3e3] placeholder:text-[#bdc1c6] dark:placeholder:text-[#5f6368] min-h-[50px] max-h-[120px] leading-relaxed custom-scrollbar font-normal"
              placeholder="What's in your fridge?"
              value={genieInput}
              onChange={(e) => setGenieInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (genieInput.trim() && !genieLoading) generateGenieIdeasAction();
                }
              }}
            />
            
            <div className="flex items-center justify-end gap-1">
              <button 
                type="button"
                className="p-2 text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] rounded-lg transition-colors"
                title="Rewrite"
              >
                <Sparkles className="w-5 h-5 opacity-60" />
              </button>
              <button 
                type="button"
                className="p-2 text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] rounded-lg transition-colors"
                title="Voice input"
              >
                <Mic className="w-5 h-5 opacity-60" />
              </button>
              <button 
                type="button"
                className="p-2 text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] rounded-lg transition-colors"
                title="Add context"
              >
                <Plus className="w-5 h-5 opacity-60" />
              </button>
              
              <div className="w-2"></div>
              
              <button 
                onClick={generateGenieIdeasAction}
                disabled={genieLoading || !genieInput.trim() || loadingRecipe}
                className="w-10 h-10 bg-[#0b57d0] dark:bg-[#0b57d0] text-white rounded-lg flex items-center justify-center transition-all hover:bg-[#0842a0] disabled:bg-[#f1f3f4] dark:disabled:bg-[#2d2e30] disabled:text-[#bdc1c6] dark:disabled:text-[#5f6368] active:scale-95 shrink-0"
              >
                {genieLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
