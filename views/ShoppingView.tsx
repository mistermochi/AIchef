
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ShoppingCart, Trash2, Check, Package, Layers, ClipboardCheck, 
  Cpu, Loader2, Play, Timer, Activity, Waves, 
  Camera, CameraOff, X, ChevronLeft, ChevronRight,
  ArrowRightLeft, CookingPot, Utensils, ListChecks, Settings2,
  Minus, Plus
} from 'lucide-react';
import { ShoppingListItem, Ingredient, View, OrchestrationPlan } from '../types';

interface ShoppingViewProps {
  shoppingCart: ShoppingListItem[];
  clearCart: () => void;
  removeFromCart: (id: string) => void;
  updateCartItemFactor: (id: string, factor: number) => void;
  toBuyCount: number;
  doneCount: number;
  consolidatedList: Ingredient[];
  toggleIngredientCheck: (key: string) => void;
  checkedIngredients: Set<string>;
  setView: (view: View) => void;
  orchestrationPlan: OrchestrationPlan | null;
  orchestrationLoading: boolean;
  generateOrchestrationAction: () => void;
}

export const ShoppingView: React.FC<ShoppingViewProps> = ({
  shoppingCart, clearCart, removeFromCart,
  updateCartItemFactor, toBuyCount, doneCount, consolidatedList,
  toggleIngredientCheck, checkedIngredients, setView,
  orchestrationPlan, orchestrationLoading, generateOrchestrationAction
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [showOrchestrator, setShowOrchestrator] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // --- Hands-free / Gesture Engine for Orchestrator Mode ---
  const [airGesturesEnabled, setAirGesturesEnabled] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const accumulatedVelocity = useRef<number>(0);
  const lastCentroidX = useRef<number | null>(null);
  const lastGestureTime = useRef<number>(0);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator && showOrchestrator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        setIsWakeLockActive(true);
      } catch (err) {
        setIsWakeLockActive(false);
      }
    }
  };

  useEffect(() => {
    if (showOrchestrator) requestWakeLock();
    else if (wakeLockRef.current) {
      wakeLockRef.current.release();
      setIsWakeLockActive(false);
    }
    return () => wakeLockRef.current?.release();
  }, [showOrchestrator]);

  const nextStep = useCallback(() => {
    if (orchestrationPlan && currentStep < orchestrationPlan.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, orchestrationPlan]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const processFrame = () => {
      if (!videoRef.current || !canvasRef.current || !airGesturesEnabled) return;
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, 160, 120);
      const currentFrame = ctx.getImageData(0, 0, 160, 120).data;
      if (prevFrameRef.current) {
        let motionPixels = 0, sumX = 0;
        for (let i = 0; i < currentFrame.length; i += 8) {
          if (Math.abs(currentFrame[i] - prevFrameRef.current[i]) > 35) {
            motionPixels++; sumX += (i/4) % 160;
          }
        }
        if (motionPixels > 200) {
          const currentCentroidX = sumX / motionPixels;
          if (lastCentroidX.current !== null) accumulatedVelocity.current += currentCentroidX - lastCentroidX.current;
          lastCentroidX.current = currentCentroidX;
        } else {
          accumulatedVelocity.current *= 0.8; lastCentroidX.current = null;
        }
        const now = Date.now();
        if (now - lastGestureTime.current > 1200) {
          if (accumulatedVelocity.current < -25) { nextStep(); lastGestureTime.current = now; accumulatedVelocity.current = 0; }
          else if (accumulatedVelocity.current > 25) { prevStep(); lastGestureTime.current = now; accumulatedVelocity.current = 0; }
        }
      }
      prevFrameRef.current = currentFrame;
      animationId = requestAnimationFrame(processFrame);
    };

    if (airGesturesEnabled && showOrchestrator) {
      navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120, facingMode: 'user' } })
        .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; animationId = requestAnimationFrame(processFrame); });
    } else {
      stream?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationId);
    }
    return () => { stream?.getTracks().forEach(t => t.stop()); cancelAnimationFrame(animationId); };
  }, [airGesturesEnabled, showOrchestrator, nextStep, prevStep]);

  if (shoppingCart.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 px-4 text-center">
        <div className="w-20 h-20 bg-white dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <ShoppingCart className="w-10 h-10 text-[#bdc1c6] dark:text-[#5f6368]" />
        </div>
        <h3 className="text-xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans">Shopping List is Empty</h3>
        <p className="text-[14px] text-[#444746] dark:text-[#c4c7c5] mt-2 max-w-xs leading-relaxed">
          Add some recipes from your Cookbook to generate a consolidated shopping list.
        </p>
        <button 
          onClick={() => setView('cookbook')} 
          className="mt-8 bg-[#0b57d0] text-white px-8 py-3 rounded-xl text-[14px] font-bold hover:bg-[#0842a0] transition-all flex items-center gap-2 shadow-md active:scale-95"
        >
          <Utensils className="w-4 h-4" /> 
          Go to Cookbook
        </button>
      </div>
    );
  }

  const progressPercent = Math.round((doneCount / (toBuyCount + doneCount || 1)) * 100);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 overflow-hidden">
      
      {/* 1. HIGH-PRECISION STICKY HEADER */}
      <div className="flex flex-col gap-3 mb-4 shrink-0 px-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans leading-none">Shopping Spec</h2>
            <div className="flex items-center gap-2 mt-1.5">
               <span className="text-[11px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] uppercase tracking-wider">{progressPercent}% DONE</span>
               <div className="h-1 w-12 bg-[#f1f3f4] dark:bg-[#2d2e30] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0b57d0]" style={{ width: `${progressPercent}%` }} />
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {orchestrationLoading ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f9fa] dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-[#0b57d0]" />
              </div>
            ) : orchestrationPlan ? (
              <button 
                onClick={() => setShowOrchestrator(true)}
                className="bg-[#0b57d0] text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <CookingPot className="w-4 h-4" /> <span className="hidden sm:inline">Start Cooking</span>
              </button>
            ) : (
              <button 
                onClick={generateOrchestrationAction}
                className="bg-[#e8f0fe] dark:bg-[#2d2e30] text-[#0b57d0] dark:text-[#8ab4f8] px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest border border-[#d2e3fc] dark:border-[#3c4043] flex items-center gap-2 active:scale-95 transition-all"
              >
                <Cpu className="w-4 h-4" /> <span className="hidden sm:inline">Orchestrate</span>
              </button>
            )}
            
            <div className="w-px h-6 bg-[#dadce0] dark:bg-[#3c4043] mx-1"></div>
            
            <button 
              onClick={() => setShowSources(!showSources)}
              className={`p-2 rounded-lg border transition-all ${showSources ? 'bg-[#e8f0fe] border-[#d2e3fc] text-[#0b57d0]' : 'bg-white dark:bg-[#1b1b1b] border-[#dadce0] dark:border-[#3c4043] text-[#444746] dark:text-[#c4c7c5]'}`}
            >
              <Settings2 className="w-5 h-5" />
            </button>
            
            <button onClick={() => setIsConfirming(true)} className="p-2 rounded-lg bg-white dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] text-[#ba1a1a] hover:bg-red-50">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE MAIN LIST - MAX VISIBILITY */}
      <div className="flex-1 min-h-0 bg-white dark:bg-[#1b1b1b] studio-card overflow-hidden shadow-sm border-[#dadce0] dark:border-[#3c4043] flex flex-col transition-colors">
        <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center px-4 bg-[#f8f9fa] dark:bg-[#111111] shrink-0">
           <div className="flex items-center gap-2 text-[10px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-widest">
              <ListChecks className="w-3.5 h-3.5 text-[#0b57d0]" />
              <span>Consolidated Ingredients ({consolidatedList.length})</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#f1f3f4] dark:divide-[#3c4043] overscroll-contain">
          {consolidatedList.map((ing, idx) => {
            const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
            const isChecked = checkedIngredients.has(key);
            return (
              <div 
                key={idx}
                onClick={() => toggleIngredientCheck(key)}
                className={`flex items-center gap-4 px-4 py-4 cursor-pointer transition-all hover:bg-[#f8f9fa] dark:hover:bg-[#2d2e30] active:bg-[#f1f3f4] dark:active:bg-[#2d2e30] ${
                  isChecked ? 'bg-[#fcfdfe] dark:bg-[#0f1114]/30' : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                  isChecked 
                    ? 'bg-[#0b57d0] border-[#0b57d0]' 
                    : 'bg-white dark:bg-transparent border-[#dadce0] dark:border-[#3c4043]'
                }`}>
                  {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] font-medium transition-all ${
                    isChecked ? 'text-[#bdc1c6] dark:text-[#5f6368] line-through' : 'text-[#1f1f1f] dark:text-[#e3e3e3]'
                  }`}>
                    {ing.name}
                  </p>
                </div>
                <div className="shrink-0">
                  <span className={`text-[12px] font-bold font-mono px-3 py-1.5 rounded-xl border transition-all ${
                    isChecked 
                      ? 'bg-transparent text-[#bdc1c6] border-[#f1f3f4] dark:border-[#3c4043]' 
                      : 'bg-[#e8f0fe] dark:bg-[#2d2e30] text-[#0b57d0] dark:text-[#8ab4f8] border-[#d2e3fc] dark:border-[#3c4043]'
                  }`}>
                    {Number(ing.quantity.toFixed(2))} {ing.unit}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="h-24 md:hidden" /> {/* Navigation spacer */}
        </div>
      </div>

      {/* 3. SOURCES DRAWER */}
      {showSources && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-end lg:items-center justify-center p-0 lg:p-4" onClick={() => setShowSources(false)}>
          <div className="w-full lg:max-w-md bg-white dark:bg-[#1b1b1b] rounded-t-3xl lg:rounded-2xl shadow-2xl border-t lg:border border-[#dadce0] dark:border-[#3c4043] overflow-hidden animate-in slide-in-from-bottom-20" onClick={e => e.stopPropagation()}>
            <div className="h-12 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between px-5 bg-[#f8f9fa] dark:bg-[#111111]">
              <span className="text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-widest flex items-center gap-2"><Layers className="w-4 h-4" /> Active Recipe Adapters</span>
              <button onClick={() => setShowSources(false)}><X className="w-5 h-5 text-[#444746]"/></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
              {shoppingCart.map(item => (
                <div key={item.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[14px] font-bold text-[#1f1f1f] dark:text-[#e3e3e3] truncate pr-4">{item.title}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-[#ba1a1a]"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <div className="flex items-center justify-between bg-[#f8f9fa] dark:bg-[#0f1114] p-1.5 rounded-lg border border-[#f1f3f4] dark:border-[#3c4043]">
                    <span className="text-[11px] font-bold text-[#8e918f] px-2 uppercase">Scale Factor</span>
                    <div className="flex items-center gap-1 bg-white dark:bg-[#1b1b1b] rounded-md border border-[#dadce0] dark:border-[#3c4043] shadow-sm">
                      <button onClick={() => updateCartItemFactor(item.id, item.scalingFactor - 0.5)} className="p-1.5"><Minus className="w-4 h-4 text-[#444746]"/></button>
                      <span className="text-[12px] font-mono font-bold w-12 text-center text-[#0b57d0]">{item.scalingFactor}x</span>
                      <button onClick={() => updateCartItemFactor(item.id, item.scalingFactor + 0.5)} className="p-1.5"><Plus className="w-4 h-4 text-[#444746]"/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-[#f8f9fa] dark:bg-[#0f1114] border-t border-[#dadce0] dark:border-[#3c4043]">
              <button onClick={() => setShowSources(false)} className="w-full py-3 bg-[#0b57d0] text-white rounded-xl font-bold uppercase text-[12px] tracking-widest shadow-lg active:scale-95 transition-transform">Apply Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONFIRMATION DIALOG */}
      {isConfirming && (
        <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-[#1b1b1b] rounded-2xl shadow-2xl border border-[#dadce0] dark:border-[#3c4043] p-6 max-w-sm w-full animate-in zoom-in-95">
              <h3 className="text-lg font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans mb-2 text-center">Flush Shopping List?</h3>
              <p className="text-sm text-[#444746] dark:text-[#c4c7c5] text-center mb-6 leading-relaxed">This will clear your consolidated spec and all {shoppingCart.length} recipes from the cart.</p>
              <div className="flex gap-3">
                 <button onClick={() => setIsConfirming(false)} className="flex-1 py-3 border border-[#dadce0] dark:border-[#3c4043] rounded-xl font-bold text-[#444746] dark:text-[#c4c7c5]">Cancel</button>
                 <button onClick={() => { clearCart(); setIsConfirming(false); }} className="flex-1 py-3 bg-[#ba1a1a] text-white rounded-xl font-bold shadow-lg">Confirm Flush</button>
              </div>
           </div>
        </div>
      )}

      {/* --- FULL-SCREEN ORCHESTRATOR SCREEN --- */}
      {showOrchestrator && orchestrationPlan && (
        <div className="fixed inset-0 z-[120] bg-white dark:bg-[#0f1114] flex flex-col transition-colors animate-in zoom-in-95 duration-300 select-none">
          <header className="h-16 md:h-20 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between px-6 md:px-12 shrink-0 bg-white dark:bg-[#1b1b1b] sticky top-0">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#0b57d0] rounded-xl flex items-center justify-center shadow-lg">
                 <Cpu className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h1 className="text-lg md:text-xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans leading-none">Kitchen Orchestrator</h1>
                 <p className="text-[10px] md:text-[11px] font-bold text-[#8e918f] uppercase tracking-widest mt-1.5">Consolidated Logic Mode</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                onClick={() => setAirGesturesEnabled(!airGesturesEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase transition-all shadow-sm ${
                  airGesturesEnabled 
                    ? 'bg-[#e8f0fe] text-[#0b57d0] border border-[#d2e3fc]' 
                    : 'bg-[#f1f3f4] dark:bg-[#2d2e30] text-[#444746] dark:text-[#8e918f]'
                }`}
               >
                 {airGesturesEnabled ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
                 <span className="hidden sm:inline">Gestures</span>
               </button>
               <div className="w-px h-8 bg-[#dadce0] dark:border-[#3c4043] mx-1"></div>
               <button onClick={() => setShowOrchestrator(false)} className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-[#ba1a1a]"><X className="w-6 h-6"/></button>
            </div>
          </header>

          <div className="flex-1 relative flex flex-col items-center justify-center p-8 md:p-16 text-center">
             <div className="absolute top-0 left-0 h-2 bg-[#0b57d0] transition-all duration-700 ease-out z-[101]" style={{ width: `${((currentStep + 1) / orchestrationPlan.steps.length) * 100}%` }}></div>

             {airGesturesEnabled && (
                <div className="absolute top-8 right-8 p-1.5 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline muted className="w-32 h-24 md:w-48 md:h-36 object-cover rounded-xl scale-x-[-1]" />
                  <canvas ref={canvasRef} width="160" height="120" className="hidden" />
                </div>
             )}

             <div className="max-w-5xl space-y-8 md:space-y-12 animate-in slide-in-from-bottom-8 duration-500">
                <div className="space-y-4">
                   <span className={`text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] px-5 py-1.5 rounded-full border shadow-sm ${
                     orchestrationPlan.steps[currentStep].type === 'prep' ? 'bg-[#e8f0fe] text-[#0b57d0] border-[#d2e3fc]' : 
                     orchestrationPlan.steps[currentStep].type === 'cook' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                     'bg-green-50 text-green-600 border-green-100'
                   }`}>
                      {orchestrationPlan.steps[currentStep].type} Stage
                   </span>
                   
                   <div className="px-8 py-3 bg-[#f8f9fa] dark:bg-[#1b1b1b] rounded-2xl inline-flex items-center gap-3 border border-[#dadce0] dark:border-[#3c4043] shadow-sm">
                      <CookingPot className="w-5 h-5 text-[#0b57d0]" />
                      <span className="text-[16px] md:text-[22px] font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans">{orchestrationPlan.steps[currentStep].recipeContext}</span>
                   </div>
                </div>

                <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans leading-tight">
                   {orchestrationPlan.steps[currentStep].description}
                </h2>

                <div className="flex items-center justify-center gap-10 md:gap-16 pt-10">
                  <button onClick={prevStep} disabled={currentStep === 0} className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-[#dadce0] flex items-center justify-center text-[#444746] disabled:opacity-20 active:scale-90 transition-all"><ChevronLeft className="w-10 h-10 md:w-14 md:h-14" /></button>
                  <button onClick={nextStep} disabled={currentStep === orchestrationPlan.steps.length - 1} className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#0b57d0] flex items-center justify-center text-white shadow-xl active:scale-90 transition-all"><ChevronRight className="w-12 h-12 md:w-16 md:h-16" /></button>
                </div>
                
                <div className="flex items-center justify-center gap-8 md:gap-12 opacity-50 pt-10">
                   <div className="flex items-center gap-3 text-[11px] md:text-[13px] font-bold uppercase tracking-widest"><Waves className="w-5 h-5 text-[#0b57d0]" /> Wave Hand</div>
                   <div className="w-px h-6 bg-[#dadce0] dark:bg-[#3c4043]"></div>
                   <div className="flex items-center gap-3 text-[11px] md:text-[13px] font-bold uppercase tracking-widest"><ArrowRightLeft className="w-5 h-5" /> Arrow Keys</div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
