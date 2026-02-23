
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ClipboardList, Mic, MicOff, Volume2, Timer, Pause, Play, X, ChevronDown, Sparkles, ChefHat, Utensils, Clock } from 'lucide-react';
import { Modal, ModalHeader, ModalContent } from '../UI';
import { useMakeController, ActiveTimer } from '../../hooks/controllers/useMakeController';

// --- ISOLATED TIMER COMPONENT ---
// Handles its own frequency updates to avoid re-rendering the parent
const ActiveTimerDisplay: React.FC<{ 
  timer: ActiveTimer, 
  onToggle: () => void, 
  onStop: () => void 
}> = ({ timer, onToggle, onStop }) => {
  const calculateRemaining = () => {
    // If paused, 'endsAt' holds the remaining milliseconds
    if (timer.status === 'paused') return Math.ceil(timer.endsAt / 1000);
    if (timer.status === 'done') return 0;
    // If running, 'endsAt' holds the target timestamp
    return Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000));
  };

  const [displaySeconds, setDisplaySeconds] = useState(calculateRemaining());

  useEffect(() => {
    if (timer.status !== 'running') {
        setDisplaySeconds(calculateRemaining());
        return;
    }

    // High frequency update for responsiveness
    const interval = setInterval(() => {
        const left = calculateRemaining();
        setDisplaySeconds(left);
        if (left <= 0) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [timer.status, timer.endsAt]);

  const formatTime = (seconds: number) => {
    // Guard against invalid numbers to prevent NaN:NaN
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    
    // Force integer values
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-5 px-6 py-2 rounded-2xl bg-surface-variant/40 dark:bg-surface-variant-dark/40 backdrop-blur-md border border-outline/10 animate-in zoom-in fade-in duration-300">
      <div className="flex flex-col items-start min-w-[100px]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-content-tertiary truncate max-w-[120px]">
            {timer.status === 'done' ? 'Timer Finished' : timer.label}
          </span>
          <span className={`font-mono text-4xl font-bold tabular-nums leading-none ${timer.status === 'done' ? 'text-danger animate-pulse' : 'text-primary dark:text-primary-dark'}`}>
            {formatTime(displaySeconds)}
          </span>
      </div>
      
      <div className="h-10 w-px bg-outline/20 dark:bg-outline-dark/20" />

      <div className="flex items-center gap-1">
          {timer.status !== 'done' && (
            <button 
              onClick={onToggle} 
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              {timer.status === 'running' ? <Pause className="w-8 h-8 fill-current text-content dark:text-content-dark" /> : <Play className="w-8 h-8 fill-current text-content dark:text-content-dark" />}
            </button>
          )}
          <button 
            onClick={onStop} 
            className="p-2 hover:bg-danger/10 text-content-tertiary hover:text-danger rounded-full transition-colors active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
      </div>
    </div>
  );
};


import { VoiceCommand } from '../../hooks/useVoiceControl';
import { Ingredient } from '../../types';

// --- DUMB UI COMPONENT ---
export interface MakeViewUIProps {
  state: {
    recipe: {
      instructions: string[];
      ingredients: Ingredient[];
      extractedTips?: string[];
      aiSuggestions?: string[];
    } | null;
    currentStep: number;
    activeCommand: { cmd: VoiceCommand, label: string } | null;
    activeTimer: ActiveTimer | null;
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    showIngredients: boolean;
    showTips: boolean;
    isWakeLockActive: boolean;
  };
  actions: {
    nextStep: () => boolean;
    prevStep: () => boolean;
    toggleListening: () => void;
    setShowIngredients: (v: boolean) => void;
    setShowTips: (v: boolean) => void;
    closeView: () => void;
    speak: (text: string) => void;
    startSmartTimer: (seconds: number, label: string) => void;
    toggleTimer: () => void;
    stopTimer: () => void;
    parseDurationToSeconds: (num: string | number, unit: string) => number;
  };
}

export const MakeViewUI: React.FC<MakeViewUIProps> = ({ state, actions }) => {
  const { recipe, currentStep, activeCommand, activeTimer, isListening, isSpeaking, transcript, showIngredients, showTips } = state;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Prevent closing if sub-modals are open (they handle their own ESC)
        if (!showIngredients && !showTips) {
           actions.closeView();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showIngredients, showTips, actions]);

  if (!recipe) return null;

  const progressPercent = ((currentStep + 1) / recipe.instructions.length) * 100;
  const rawInstruction = recipe.instructions[currentStep];

  // --- ORCHESTRATION PARSING ---
  // Detects "[TYPE • Context] Instruction" pattern
  const orchestrationRegex = /^\[(PREP|COOK|WAIT) • (.+?)\]\s*(.*)$/i;
  const match = orchestrationRegex.exec(rawInstruction);
  
  let stepType = null;
  let stepContext = null;
  let instructionText = rawInstruction;

  if (match) {
    stepType = match[1].toUpperCase();
    stepContext = match[2];
    instructionText = match[3];
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'PREP': return { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-700/50', icon: ChefHat };
      case 'COOK': return { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-700/50', icon: Utensils };
      case 'WAIT': return { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-700/50', icon: Clock };
      default: return { bg: 'bg-surface-variant', text: 'text-content', border: 'border-outline', icon: Sparkles };
    }
  };

  const renderInstructionText = (text: string) => {
    // Regex for both English and Chinese time units
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

      // Ensure we only create a button if seconds is a valid number greater than 0
      if (Number.isFinite(seconds) && seconds > 0) {
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

  // Combine extracted tips and AI suggestions
  const allTips = [
    ...(recipe.extractedTips || []),
    ...(recipe.aiSuggestions || [])
  ];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-surface dark:bg-surface-dark text-content dark:text-content-dark overflow-hidden animate-in zoom-in-95 duration-300">
      
      {/* 1. TOP BAR */}
      <div className="h-14 shrink-0 flex items-center justify-between px-4 relative z-20">
        <button onClick={actions.closeView} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-content-secondary transition-colors">
           <ChevronDown className="w-6 h-6" />
        </button>
        
        <div className="text-xs font-bold text-content-tertiary uppercase tracking-widest">
           Step {currentStep + 1} / {recipe.instructions.length}
        </div>

        <div className="w-10" /> 
      </div>

      <div className="h-1 w-full bg-surface-variant dark:bg-surface-variant-dark">
         <div className="h-full bg-primary dark:bg-primary-dark transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        {/* Transcript Overlay */}
        {isListening && transcript && !activeCommand && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full text-white text-sm font-medium animate-in slide-in-from-top-2 fade-in z-10 max-w-[80%] truncate">
              "{transcript}"
           </div>
        )}

        {/* Command Feedback Overlay */}
        {activeCommand && (
          <div className="absolute z-50 flex flex-col items-center justify-center p-8 bg-black/80 backdrop-blur-md rounded-3xl animate-in zoom-in-95 fade-in duration-200 pointer-events-none">
             <span className="text-lg font-bold text-white tracking-widest uppercase text-center">{activeCommand.label}</span>
          </div>
        )}

        {/* Text Container */}
        <div className="w-full max-w-4xl relative group flex flex-col items-center my-auto">
           
           {/* ORCHESTRATOR METADATA BADGES */}
           {stepType && stepContext && (
              <div className="flex flex-wrap justify-center items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4">
                 {(() => {
                    const style = getTypeStyles(stepType);
                    const Icon = style.icon;
                    return (
                      <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 font-bold text-sm tracking-wide shadow-sm border ${style.bg} ${style.text} ${style.border}`}>
                         <Icon className="w-4 h-4" />
                         <span>{stepType}</span>
                      </div>
                    );
                 })()}
                 <div className="px-4 py-1.5 rounded-full bg-surface-variant dark:bg-surface-variant-dark border border-outline dark:border-outline-dark text-content-secondary dark:text-content-secondary-dark text-sm font-medium flex items-center gap-2 shadow-sm max-w-[200px] md:max-w-xs">
                    <span className="opacity-60 text-xs uppercase tracking-wider font-bold shrink-0">Recipe:</span>
                    <span className="truncate">{stepContext}</span>
                 </div>
              </div>
           )}

           <div 
             key={currentStep} 
             className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold google-sans leading-tight text-center text-content dark:text-content-dark animate-in fade-in slide-in-from-bottom-8 duration-500 select-none py-4"
           >
             {renderInstructionText(instructionText)}
           </div>

           {/* Actions Row */}
           <div className="mt-8 md:mt-12 flex flex-wrap justify-center items-center gap-6 transition-all duration-500">
              
              <button 
                onClick={() => !isSpeaking && actions.speak(instructionText)} // Speak only the clean text
                disabled={isSpeaking}
                className={`p-4 rounded-full transition-all shadow-sm active:scale-95 ${
                  isSpeaking 
                    ? 'bg-surface-variant/50 dark:bg-surface-variant-dark/50 text-content-tertiary cursor-not-allowed animate-pulse' 
                    : 'bg-surface-variant dark:bg-surface-variant-dark text-primary dark:text-primary-dark hover:bg-primary-container'
                }`}
              >
                {isSpeaking ? <Volume2 className="w-6 h-6 animate-pulse opacity-50" /> : <Volume2 className="w-6 h-6" />}
              </button>

              {activeTimer && (
                 <ActiveTimerDisplay 
                    timer={activeTimer} 
                    onToggle={actions.toggleTimer} 
                    onStop={actions.stopTimer} 
                 />
              )}
           </div>
        </div>
      </div>

      {/* 3. CONTROL DECK */}
      <div className="h-24 md:h-28 shrink-0 px-6 pb-6 flex items-center justify-center relative z-20">
         <div className="w-full max-w-md flex items-center justify-between px-6 py-3 bg-surface-variant/80 dark:bg-surface-variant-dark/80 backdrop-blur-xl border border-outline/20 dark:border-outline-dark/20 rounded-full shadow-2xl">
            
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => actions.setShowIngredients(true)}
                  className="p-4 rounded-full text-content-secondary dark:text-content-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
                >
                  <ClipboardList className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => actions.setShowTips(true)}
                  className="p-4 rounded-full text-content-secondary dark:text-content-secondary-dark hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all"
                >
                  <Sparkles className="w-6 h-6" />
                </button>
            </div>

            <button 
              onClick={actions.toggleListening}
              className={`w-16 h-16 -mt-8 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${isListening ? 'bg-primary dark:bg-primary-dark text-white ring-4 ring-primary/20 dark:ring-primary-dark/20 animate-pulse' : 'bg-surface dark:bg-surface-dark text-content border border-outline dark:border-outline-dark'}`}
            >
               {isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-6 h-6 opacity-40" />}
            </button>

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

      {/* INGREDIENTS DRAWER */}
      {showIngredients && (
        <Modal onClose={() => actions.setShowIngredients(false)} size="md">
          <ModalHeader title="Ingredients" onClose={() => actions.setShowIngredients(false)} />
          <ModalContent>
             <div className="space-y-0 divide-y divide-outline/20">
               {recipe.ingredients.map((ing: Ingredient, i: number) => (
                 <div key={i} className="flex justify-between items-center py-4">
                    <span className="text-lg font-medium">{ing.name}</span>
                    <span className="font-bold font-mono text-primary dark:text-primary-dark bg-primary-container/20 px-2 py-1 rounded">{ing.quantity} {ing.unit}</span>
                 </div>
               ))}
             </div>
          </ModalContent>
        </Modal>
      )}

      {/* TIPS DRAWER */}
      {showTips && (
        <Modal onClose={() => actions.setShowTips(false)} size="md">
          <ModalHeader title="Chef's Tips" onClose={() => actions.setShowTips(false)} />
          <ModalContent>
             <div className="space-y-4">
               {allTips.length === 0 && (
                 <div className="text-center text-content-tertiary py-8">No specific tips available.</div>
               )}
               {allTips.map((tip: string, i: number) => (
                 <div key={`tip-${i}`} className="p-4 rounded-xl bg-surface-variant dark:bg-surface-variant-dark border border-outline/30 dark:border-outline-dark/30 flex gap-3">
                    <Sparkles className="w-5 h-5 text-content-tertiary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{tip}</span>
                 </div>
               ))}
             </div>
          </ModalContent>
        </Modal>
      )}

    </div>,
    document.body
  );
};

// --- CONNECTED CONTAINER ---
export const MakeView: React.FC = () => {
  const { state, actions } = useMakeController();
  return <MakeViewUI state={state} actions={actions} />;
};
