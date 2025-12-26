import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Camera, CameraOff, Lightbulb, ClipboardList, X, ChevronDown, ChevronUp, ArrowRightLeft, Waves, SunMedium } from 'lucide-react';
import { Recipe } from '../types';

interface MakeViewProps {
  recipe: Recipe;
  scalingFactor: number;
}

export const MakeView: React.FC<MakeViewProps> = ({ recipe, scalingFactor }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngOverlay, setShowIngOverlay] = useState(false);
  const [showTipsOverlay, setShowTipsOverlay] = useState(false);
  const [airGesturesEnabled, setAirGesturesEnabled] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<'left' | 'right' | null>(null);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const lastGestureTime = useRef<number>(0);
  const accumulatedVelocity = useRef<number>(0);

  const nextStep = useCallback(() => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(prev => prev + 1); setGestureFeedback('right'); setTimeout(() => setGestureFeedback(null), 800);
    }
  }, [currentStep, recipe.instructions.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1); setGestureFeedback('left'); setTimeout(() => setGestureFeedback(null), 800);
    }
  }, [currentStep]);

  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try { wakeLockRef.current = await (navigator as any).wakeLock.request('screen'); setIsWakeLockActive(true); } 
        catch (err) { setIsWakeLockActive(false); }
      }
    };
    requestWakeLock();
    return () => wakeLockRef.current?.release();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null, animationId: number;
    const processFrame = () => {
      if (!videoRef.current || !canvasRef.current || !airGesturesEnabled) return;
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, 160, 120);
      const currentFrame = ctx.getImageData(0, 0, 160, 120).data;
      if (prevFrameRef.current) {
        let mass = 0, sumX = 0;
        for (let i = 0; i < currentFrame.length; i += 8) {
          if (Math.abs(currentFrame[i] - prevFrameRef.current[i]) > 35) { mass++; sumX += (i/4) % 160; }
        }
        if (mass > 200) accumulatedVelocity.current += (sumX/mass) - (accumulatedVelocity.current / 5);
        else accumulatedVelocity.current *= 0.8;
        const now = Date.now();
        if (now - lastGestureTime.current > 1200) {
          if (accumulatedVelocity.current < -25) { nextStep(); lastGestureTime.current = now; accumulatedVelocity.current = 0; }
          else if (accumulatedVelocity.current > 25) { prevStep(); lastGestureTime.current = now; accumulatedVelocity.current = 0; }
        }
      }
      prevFrameRef.current = currentFrame; animationId = requestAnimationFrame(processFrame);
    };
    if (airGesturesEnabled) {
      navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120, facingMode: 'user' } }).then(s => { 
        stream = s; if (videoRef.current) videoRef.current.srcObject = s; animationId = requestAnimationFrame(processFrame); 
      });
    }
    return () => { stream?.getTracks().forEach(t => t.stop()); cancelAnimationFrame(animationId); };
  }, [airGesturesEnabled, nextStep, prevStep]);

  return (
    <div className="flex-1 relative flex flex-col bg-white dark:bg-[#0f1114] overflow-hidden select-none animate-in fade-in">
      {gestureFeedback && <div className={`absolute ${gestureFeedback === 'left' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'} inset-y-0 w-24 from-[#0b57d0]/10 to-transparent z-[56] flex items-center justify-center animate-pulse`}>{gestureFeedback === 'left' ? <ChevronLeft className="w-12 h-12 text-[#0b57d0]" /> : <ChevronRight className="w-12 h-12 text-[#0b57d0]" />}</div>}
      
      <div className="absolute top-4 right-4 z-[55] flex flex-col items-end gap-2">
         {isWakeLockActive && <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shadow-sm animate-pulse"><SunMedium className="w-3 h-3" /> Awake</div>}
         <button onClick={() => setAirGesturesEnabled(!airGesturesEnabled)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-sm ${airGesturesEnabled ? 'bg-[#e8f0fe] text-[#0b57d0] border border-[#d2e3fc]' : 'bg-white/80 dark:bg-[#1b1b1b]/80 text-[#444746] dark:text-[#8e918f] border border-[#dadce0] dark:border-[#3c4043]'}`}>{airGesturesEnabled ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />} Gestures</button>
         {airGesturesEnabled && <div className="p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/20"><video ref={videoRef} autoPlay playsInline muted className="w-24 h-18 object-cover rounded scale-x-[-1]" /></div>}
         <canvas ref={canvasRef} width="160" height="120" className="hidden" />
      </div>

      <button onClick={() => setShowTipsOverlay(true)} className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#f8f9fa] dark:bg-[#1b1b1b] border-x border-b border-[#dadce0] dark:border-[#3c4043] rounded-b-2xl text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-widest flex items-center gap-2 shadow-sm"><Lightbulb className="w-3.5 h-3.5" /> Tips <ChevronDown className="w-3 h-3" /></button>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12">
        <div className="space-y-4 text-mono font-bold tracking-[0.2em] uppercase text-[#bdc1c6] dark:text-[#5f6368]">Step {currentStep + 1} of {recipe.instructions.length}<div className="w-24 h-1 bg-[#0b57d0] mx-auto rounded-full mt-2" /></div>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold google-sans leading-tight text-[#1f1f1f] dark:text-[#e3e3e3]">{recipe.instructions[currentStep]}</h2>
        <div className="flex items-center justify-center gap-12"><button onClick={prevStep} disabled={currentStep === 0} className="w-20 h-20 rounded-full bg-[#f8f9fa] dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] flex items-center justify-center text-[#444746] dark:text-[#c4c7c5] disabled:opacity-30 transition-all"><ChevronLeft className="w-10 h-10" /></button><button onClick={nextStep} disabled={currentStep === recipe.instructions.length - 1} className="w-20 h-20 rounded-full bg-[#0b57d0] flex items-center justify-center text-white shadow-xl active:scale-95 transition-all"><ChevronRight className="w-10 h-10" /></button></div>
        <div className="flex items-center justify-center gap-6 opacity-60 pt-4"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8e918f]"><ArrowRightLeft className="w-3 h-3" /> Swipe</div><div className="w-px h-3 bg-[#dadce0] dark:bg-[#3c4043]"></div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0b57d0] dark:text-[#8ab4f8]"><Waves className="w-3 h-3" /> Wave Hand</div></div>
      </div>

      <button onClick={() => setShowIngOverlay(true)} className="absolute bottom-0 left-1/2 -translate-x-1/2 px-6 py-3 bg-white dark:bg-[#1b1b1b] border-x border-t border-[#dadce0] dark:border-[#3c4043] rounded-t-2xl text-[11px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] uppercase tracking-widest flex items-center gap-2 shadow-lg"><ClipboardList className="w-3.5 h-3.5" /> Ingredients <ChevronUp className="w-3 h-3" /></button>

      {/* Overlays */}
      <div className={`absolute inset-x-0 bottom-0 h-[85%] bg-white dark:bg-[#1b1b1b] border-t border-[#dadce0] dark:border-[#3c4043] z-50 transform transition-transform duration-300 rounded-t-3xl shadow-2xl ${showIngOverlay ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-[#dadce0] dark:border-[#3c4043]"><div className="text-[12px] font-bold uppercase text-[#0b57d0] dark:text-[#8ab4f8]">Ingredients ({scalingFactor}x)</div><button onClick={() => setShowIngOverlay(false)}><X className="w-6 h-6 text-[#444746] dark:text-[#8e918f]"/></button></div>
        <div className="p-6 overflow-y-auto h-[calc(100%-70px)] grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipe.ingredients.map((ing, i) => (<div key={i} className="flex justify-between p-4 border-b border-[#f1f3f4] dark:border-[#3c4043]"><span className="font-medium text-[#1f1f1f] dark:text-[#e3e3e3]">{ing.name}</span><span className="font-bold text-[#0b57d0] dark:text-[#8ab4f8] font-mono">{Number((ing.quantity * scalingFactor).toFixed(2))} {ing.unit}</span></div>))}
        </div>
      </div>
      
      <div className={`absolute inset-x-0 top-0 h-full bg-white/95 dark:bg-[#0f1114]/95 backdrop-blur-md z-50 transform transition-transform duration-300 flex flex-col ${showTipsOverlay ? 'translate-y-0' : '-translate-y-full'}`}>
         <div className="h-14 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between px-6 shrink-0"><div className="flex items-center gap-2 text-[12px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] uppercase tracking-wider"><Lightbulb className="w-4 h-4" /> Tips</div><button onClick={() => setShowTipsOverlay(false)}><X className="w-6 h-6 text-[#444746] dark:text-[#8e918f]" /></button></div>
         <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8">
            <section><h3 className="text-[11px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-widest mb-4">Recipe Tips</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{recipe.extractedTips?.map((tip, idx) => (<div key={idx} className="p-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] rounded-xl border border-[#dadce0] dark:border-[#3c4043] text-[14px] leading-relaxed text-[#1f1f1f] dark:text-[#e3e3e3]">{tip}</div>))}</div></section>
            <section><h3 className="text-[11px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-widest mb-4">AI Suggestions</h3><div className="space-y-3">{recipe.aiSuggestions?.map((s, idx) => (<div key={idx} className="p-4 bg-[#e8f0fe]/30 dark:bg-[#0b57d0]/10 border border-[#d2e3fc] dark:border-[#0b57d0]/20 rounded-xl text-[14px] text-[#1f1f1f] dark:text-[#e3e3e3]">{s}</div>))}</div></section>
         </div>
      </div>
    </div>
  );
};