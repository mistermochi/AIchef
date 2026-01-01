
import React from 'react';
import { ChevronLeft, ChevronRight, ClipboardList, Mic, MicOff, Volume2, FastForward, Rewind, VolumeX, Timer, Play, Pause, X, BellRing, ChevronDown, Sparkles } from 'lucide-react';
import { Modal, ModalHeader, ModalContent } from './UI';
import { useMakeController } from '../hooks/controllers/useMakeController';

export const MakeView: React.FC = () => {
  const { state, actions } = useMakeController();
  const { recipe, currentStep, activeCommand, activeTimer, isListening, isSpeaking, transcript, showIngredients, showTips } = state;

  if (!recipe) return null;

  const progressPercent = ((currentStep + 1) / recipe.instructions.length) * 100;

  // --- RENDER HELPERS ---
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderInstructionText = (text: string) => {
    // Prioritize full words (minutes, seconds) before abbreviations (min, sec) to ensure greedy matching
    const regex = /([0-9\.]+|[零一二兩三四五六七八九十百半]+)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?|分鐘|分|小時|秒鐘|秒)/gi;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const fullString = match[0];
      const seconds = actions.parseDurationToSeconds(match[1], match[2]);

      if (seconds > 0) {
        parts.push(
          <button
            key={match.index}
            onClick={(e) => { e.stopPropagation(); actions.startSmartTimer(seconds, fullString); }}
            className="inline-flex items-baseline gap-1 mx-1 px-2 py-0.5 rounded-lg bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark font-bold border-b-2 border-primary/20 hover:bg-primary/20 transition-all cursor-pointer select-none"
          >
            <Timer className="w-4 h-4 self-center" />
            <span>{fullString}</span>
          </button>
        );
      } else {
        parts.push(fullString);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface dark:bg-surface-dark text-content dark:text-content-dark overflow-hidden animate-in zoom-in-95 duration-300">
      
      {/* 1. TOP BAR (Minimal Status) */}
      <div className="h-14 shrink-0 flex items-center justify-between px-4 relative z-20">
        <button onClick={actions.closeView} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-content-secondary transition-colors">
           <ChevronDown className="w-6 h-6" />
        </button>
        
        {/* Step Indicator (Always Visible) */}
        <div className="text-xs font-bold text-content-tertiary uppercase tracking-widest">
           Step {currentStep + 1} / {recipe.instructions.length}
        </div>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Progress Line */}
      <div className="h-1 w-full bg-surface-variant dark:bg-surface-variant-dark">
         <div className="h-full bg-primary dark:bg-primary-dark transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* 2. MAIN CONTENT (Zen Card) */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12">
        {/* Transcript Overlay */}
        {isListening && transcript && !activeCommand && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full text-white text-sm font-medium animate-in slide-in-from-top-2 fade-in z-10 max-w-[80%] truncate">
              "{transcript}"
           </div>
        )}

        {/* Command Feedback Overlay */}
        {activeCommand && (
          <div className="absolute z-50 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-md rounded-3xl animate-in zoom-in-95 fade-in duration-200 pointer-events-none">
             {activeCommand.cmd === 'NEXT_STEP' && <FastForward className="w-12 h-12 text-white mb-2" />}
             {activeCommand.cmd === 'PREV_STEP' && <Rewind className="w-12 h-12 text-white mb-2" />}
             {activeCommand.cmd === 'READ_CURRENT' && <Volume2 className="w-12 h-12 text-white mb-2" />}
             {activeCommand.cmd === 'READ_INGREDIENTS' && <ClipboardList className="w-12 h-12 text-white mb-2" />}
             {activeCommand.cmd === 'STOP_TTS' && <VolumeX className="w-12 h-12 text-white mb-2" />}
             {(activeCommand.cmd === 'START_TIMER' || activeCommand.cmd === 'RESUME_TIMER') && <Play className="w-12 h-12 text-white mb-2" />}
             {(activeCommand.cmd === 'STOP_TIMER' || activeCommand.cmd === 'PAUSE_TIMER') && <Pause className="w-12 h-12 text-white mb-2" />}
             <span className="text-lg font-bold text-white tracking-widest uppercase text-center">{activeCommand.label}</span>
          </div>
        )}

        {/* Text Container */}
        <div className="w-full max-w-4xl relative group flex flex-col items-center">
           <div 
             key={currentStep} 
             className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold google-sans leading-tight text-center text-content dark:text-content-dark animate-in fade-in slide-in-from-bottom-8 duration-500 select-none"
           >
             {renderInstructionText(recipe.instructions[currentStep])}
           </div>

           {/* In-Context Actions Row - Always Visible Now */}
           <div className="mt-12 flex flex-wrap justify-center items-center gap-6 transition-all duration-500">
              
              {/* Read Aloud Button */}
              <button 
                onClick={() => !isSpeaking && actions.speak(recipe.instructions[currentStep])}
                disabled={isSpeaking}
                className={`p-4 rounded-full transition-all shadow-sm active:scale-95 ${
                  isSpeaking 
                    ? 'bg-surface-variant/50 dark:bg-surface-variant-dark/50 text-content-tertiary cursor-not-allowed animate-pulse' 
                    : 'bg-surface-variant dark:bg-surface-variant-dark text-primary dark:text-primary-dark hover:bg-primary-container'
                }`}
                title={isSpeaking ? "Speaking..." : "Read Aloud"}
              >
                {isSpeaking ? <Volume2 className="w-6 h-6 animate-pulse opacity-50" /> : <Volume2 className="w-6 h-6" />}
              </button>

              {/* Active Timer - Flat Design */}
              {activeTimer && (
                 <div className="flex items-center gap-5 px-6 py-2 rounded-2xl bg-surface-variant/40 dark:bg-surface-variant-dark/40 backdrop-blur-md border border-outline/10 animate-in zoom-in fade-in duration-300">
                    <div className="flex flex-col items-start min-w-[100px]">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-content-tertiary truncate max-w-[120px]">
                          {activeTimer.status === 'done' ? 'Timer Finished' : activeTimer.label}
                       </span>
                       <span className={`font-mono text-4xl font-bold tabular-nums leading-none ${activeTimer.status === 'done' ? 'text-danger animate-pulse' : 'text-primary dark:text-primary-dark'}`}>
                         {formatTime(activeTimer.remaining)}
                       </span>
                    </div>
                    
                    <div className="h-10 w-px bg-outline/20 dark:bg-outline-dark/20" />

                    <div className="flex items-center gap-1">
                       {activeTimer.status !== 'done' && (
                         <button 
                           onClick={actions.toggleTimer} 
                           className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95"
                         >
                           {activeTimer.status === 'running' ? <Pause className="w-8 h-8 fill-current text-content dark:text-content-dark" /> : <Play className="w-8 h-8 fill-current text-content dark:text-content-dark" />}
                         </button>
                       )}
                       <button 
                         onClick={actions.stopTimer} 
                         className="p-2 hover:bg-danger/10 text-content-tertiary hover:text-danger rounded-full transition-colors active:scale-95"
                       >
                         <X className="w-6 h-6" />
                       </button>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* 3. CONTROL DECK (Bottom Bar) */}
      <div className="h-24 md:h-28 shrink-0 px-6 pb-6 flex items-center justify-center relative z-20">
         <div className="w-full max-w-md flex items-center justify-between px-6 py-3 bg-surface-variant/80 dark:bg-surface-variant-dark/80 backdrop-blur-xl border border-outline/20 dark:border-outline-dark/20 rounded-full shadow-2xl">
            
            {/* Left Group: Info Toggles */}
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => actions.setShowIngredients(true)}
                  className="p-4 rounded-full text-content-secondary dark:text-content-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
                  title="Ingredients"
                >
                  <ClipboardList className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => actions.setShowTips(true)}
                  className="p-4 rounded-full text-content-secondary dark:text-content-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
                  title="Chef Tips"
                >
                  <Sparkles className="w-6 h-6" />
                </button>
            </div>

            {/* Mic / Main Action */}
            <button 
              onClick={actions.toggleListening}
              className={`w-16 h-16 -mt-8 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${isListening ? 'bg-primary dark:bg-primary-dark text-white ring-4 ring-primary/20 dark:ring-primary-dark/20 animate-pulse' : 'bg-surface dark:bg-surface-dark text-content border border-outline dark:border-outline-dark'}`}
            >
               {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-6 h-6 opacity-40" />}
            </button>

            {/* Right Group: Navigation */}
            <div className="flex items-center gap-2">
               <button 
                 onClick={actions.prevStep} 
                 disabled={currentStep === 0}
                 className="p-4 rounded-full text-content-secondary dark:text-content-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-20 active:scale-95 transition-all"
               >
                 <ChevronLeft className="w-6 h-6" />
               </button>
               <button 
                 onClick={actions.nextStep} 
                 disabled={currentStep === recipe.instructions.length - 1}
                 className="p-4 rounded-full text-primary dark:text-primary-dark bg-primary-container/50 dark:bg-primary-container-dark/50 hover:bg-primary-container dark:hover:bg-primary-container-dark disabled:opacity-20 active:scale-95 transition-all"
               >
                 <ChevronRight className="w-8 h-8" />
               </button>
            </div>
         </div>
      </div>

      {/* Ingredients Drawer (Bottom Sheet) */}
      {showIngredients && (
        <Modal onClose={() => actions.setShowIngredients(false)} size="md">
          <ModalHeader title="Ingredients" onClose={() => actions.setShowIngredients(false)} />
          <ModalContent>
             <div className="space-y-0 divide-y divide-outline/20">
               {recipe.ingredients.map((ing, i) => (
                 <div key={i} className="flex justify-between items-center py-4">
                    <span className="text-lg font-medium">{ing.name}</span>
                    <span className="font-bold font-mono text-primary dark:text-primary-dark bg-primary-container/20 px-2 py-1 rounded">{ing.quantity} {ing.unit}</span>
                 </div>
               ))}
             </div>
          </ModalContent>
        </Modal>
      )}

      {/* Tips Drawer (Bottom Sheet) */}
      {showTips && (
        <Modal onClose={() => actions.setShowTips(false)} size="md">
          <ModalHeader title="Chef's Tips" onClose={() => actions.setShowTips(false)} />
          <ModalContent>
             <div className="space-y-4">
               {(!recipe.extractedTips?.length && !recipe.aiSuggestions?.length) && (
                 <div className="text-center text-content-tertiary py-8">No specific tips available for this recipe.</div>
               )}
               {recipe.extractedTips?.map((tip, i) => (
                 <div key={`tip-${i}`} className="p-4 rounded-xl bg-surface-variant dark:bg-surface-variant-dark border border-outline/30 dark:border-outline-dark/30 flex gap-3">
                    <Sparkles className="w-5 h-5 text-content-tertiary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{tip}</span>
                 </div>
               ))}
               {recipe.aiSuggestions?.map((tip, i) => (
                 <div key={`ai-${i}`} className="p-4 rounded-xl bg-primary-container/10 border border-primary/20 flex gap-3">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{tip}</span>
                 </div>
               ))}
             </div>
          </ModalContent>
        </Modal>
      )}

    </div>
  );
};
