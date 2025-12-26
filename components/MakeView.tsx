import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Camera, CameraOff, Lightbulb, ClipboardList, ChevronDown, ChevronUp, ArrowRightLeft, Waves, SunMedium } from 'lucide-react';
import { Badge } from './UI';
import { useWakeLock, useAirGestures } from '../hooks/useDevice';
import { useChefContext } from '../context/ChefContext';

export const MakeView: React.FC = () => {
  const { activeRecipe: recipe } = useChefContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngOverlay, setShowIngOverlay] = useState(false);
  const [showTipsOverlay, setShowTipsOverlay] = useState(false);
  const [airGesturesEnabled, setAirGesturesEnabled] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<'left' | 'right' | null>(null);

  const isWakeLockActive = useWakeLock();

  if (!recipe) return null;

  const handleFeedback = (direction: 'left' | 'right') => {
    setGestureFeedback(direction);
    setTimeout(() => setGestureFeedback(null), 800);
  };

  const nextStep = useCallback(() => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
      handleFeedback('right');
    }
  }, [currentStep, recipe.instructions.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      handleFeedback('left');
    }
  }, [currentStep]);

  const { videoRef, canvasRef } = useAirGestures(
    airGesturesEnabled,
    prevStep,
    nextStep
  );

  return (
    <div className="flex-1 relative flex flex-col bg-surface dark:bg-surface-variant-dark overflow-hidden select-none animate-in fade-in">
      {gestureFeedback && <div className={`absolute ${gestureFeedback === 'left' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'} inset-y-0 w-24 from-primary/10 to-transparent z-[56] flex items-center justify-center animate-pulse`}>{gestureFeedback === 'left' ? <ChevronLeft className="w-12 h-12 text-primary" /> : <ChevronRight className="w-12 h-12 text-primary" />}</div>}
      
      <div className="absolute top-4 right-4 z-[55] flex flex-col items-end gap-2">
         {isWakeLockActive && (
            <Badge variant="warning" label="Awake" icon={<SunMedium />} className="shadow-sm animate-pulse" />
         )}
         
         <Badge 
            variant={airGesturesEnabled ? 'primary' : 'neutral'}
            label="Gestures"
            icon={airGesturesEnabled ? <Camera /> : <CameraOff />}
            onClick={() => setAirGesturesEnabled(!airGesturesEnabled)}
            className="shadow-sm transition-all"
         />

         {airGesturesEnabled && <div className="p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/20"><video ref={videoRef} autoPlay playsInline muted className="w-24 h-18 object-cover rounded scale-x-[-1]" /></div>}
         <canvas ref={canvasRef} width="160" height="120" className="hidden" />
      </div>

      <button onClick={() => setShowTipsOverlay(true)} className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-2 bg-surface-variant dark:bg-surface-variant-dark border-x border-b border-outline dark:border-outline-dark rounded-b-2xl text-xs font-bold text-content-secondary dark:text-content-secondary-dark uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-surface dark:hover:bg-surface-dark transition-colors"><Lightbulb className="w-3.5 h-3.5" /> Tips <ChevronDown className="w-3 h-3" /></button>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12">
        <div className="space-y-4 text-mono font-bold tracking-[0.2em] uppercase text-content-tertiary dark:text-content-tertiary-dark">Step {currentStep + 1} of {recipe.instructions.length}<div className="w-24 h-1 bg-primary dark:bg-primary-dark mx-auto rounded-full mt-2" /></div>
        
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold google-sans leading-tight text-content dark:text-content-dark">{recipe.instructions[currentStep]}</h2>
        
        <div className="flex items-center justify-center gap-12">
            <button 
                onClick={prevStep} 
                disabled={currentStep === 0} 
                className="w-20 h-20 rounded-full bg-surface-variant dark:bg-surface-variant-dark border border-outline dark:border-outline-dark flex items-center justify-center text-content-secondary dark:text-content-secondary-dark disabled:opacity-30 transition-all active:scale-95 hover:bg-surface dark:hover:bg-surface-dark shadow-sm"
            >
                <ChevronLeft className="w-10 h-10" />
            </button>
            <button 
                onClick={nextStep} 
                disabled={currentStep === recipe.instructions.length - 1} 
                className="w-20 h-20 rounded-full bg-primary dark:bg-primary-dark flex items-center justify-center text-white shadow-xl active:scale-95 transition-all hover:bg-primary-hover dark:hover:bg-primary-hover-dark disabled:opacity-50 disabled:scale-100"
            >
                <ChevronRight className="w-10 h-10" />
            </button>
        </div>
        
        <div className="flex items-center justify-center gap-6 opacity-60 pt-4"><div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-widest text-content-tertiary dark:text-content-tertiary-dark"><ArrowRightLeft className="w-3 h-3" /> Swipe</div><div className="w-px h-3 bg-outline dark:bg-outline-dark"></div><div className="flex items-center gap-2 text-2xs font-bold uppercase tracking-widest text-primary dark:text-primary-dark"><Waves className="w-3 h-3" /> Wave Hand</div></div>
      </div>

      <button onClick={() => setShowIngOverlay(true)} className="absolute bottom-0 left-1/2 -translate-x-1/2 px-6 py-3 bg-surface dark:bg-surface-dark border-x border-t border-outline dark:border-outline-dark rounded-t-2xl text-xs font-bold text-primary dark:text-primary-dark uppercase tracking-widest flex items-center gap-2 shadow-lg hover:pb-4 transition-all"><ClipboardList className="w-3.5 h-3.5" /> Ingredients <ChevronUp className="w-3 h-3" /></button>
    </div>
  );
};