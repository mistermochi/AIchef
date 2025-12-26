import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Check, Edit3, X, ShoppingBasket, Plus, ChefHat, 
  UploadCloud, Loader2, Trash2, Sparkles, ShoppingCart, 
  Scale, Send, Info, Link as LinkIcon, ArrowRightLeft,
  Play, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Lightbulb, ClipboardList, ChevronDown, ChevronUp,
  Camera, CameraOff, Waves, Sun, SunMedium
} from 'lucide-react';
import { Recipe, ShoppingListItem } from '../types';

interface RecipeModalProps {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  close: () => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  scalingFactor: number;
  setScalingFactor: (val: number) => void;
  saveRecipe: () => Promise<void>;
  updateRecipe: () => Promise<void>;
  saving: boolean;
  saveError: string;
  refine: () => Promise<void>;
  refining: boolean;
  refinePrompt: string;
  setRefinePrompt: (val: string) => void;
  refineError: string;
  shoppingCart: ShoppingListItem[];
  onAddToCart: (recipe: Recipe, factor: number) => void;
  onRemoveFromCart: (id: string) => void;
}

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

const formatQty = (num: number) => Number(num.toFixed(2));

const RecipeModal: React.FC<RecipeModalProps> = ({ 
  recipe, setRecipe, close, 
  isEditing, setIsEditing, 
  scalingFactor, setScalingFactor,
  saveRecipe, updateRecipe, saving, saveError,
  refine, refining, refinePrompt, setRefinePrompt, refineError,
  shoppingCart, onAddToCart, onRemoveFromCart
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ingScrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const swipeHandled = useRef<boolean>(false);

  const [activeScaleIndex, setActiveScaleIndex] = useState<number | null>(null);
  const [tempScaleValue, setTempScaleValue] = useState<string>('');
  
  // Hands-free States
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngOverlay, setShowIngOverlay] = useState(false);
  const [showTipsOverlay, setShowTipsOverlay] = useState(false);

  // Air Gesture States
  const [airGesturesEnabled, setAirGesturesEnabled] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState<'left' | 'right' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const lastGestureTime = useRef<number>(0);
  const lastCentroidX = useRef<number | null>(null);
  const accumulatedVelocity = useRef<number>(0);

  // Wake Lock Ref for "Keep Screen On"
  const wakeLockRef = useRef<any>(null);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);

  const cartItem = shoppingCart.find(item => item.recipeId === recipe.id);
  const isInCart = !!cartItem;

  const nextStep = useCallback(() => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setGestureFeedback('right');
      setTimeout(() => setGestureFeedback(null), 800);
    }
  }, [currentStep, recipe.instructions.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setGestureFeedback('left');
      setTimeout(() => setGestureFeedback(null), 800);
    }
  }, [currentStep]);

  // --- Screen Wake Lock Logic ---
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && isHandsFree) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setIsWakeLockActive(true);
          
          wakeLockRef.current.addEventListener('release', () => {
            setIsWakeLockActive(false);
          });
          console.debug("Screen Wake Lock Acquired");
        } catch (err) {
          console.warn("Wake Lock failed:", err);
          setIsWakeLockActive(false);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible' && isHandsFree) {
        await requestWakeLock();
      }
    };

    if (isHandsFree) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHandsFree]);

  // Gesture handling for Hands-free Interaction (Touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    swipeHandled.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isHandsFree || swipeHandled.current) return;
    
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - touchStartY.current;
    const deltaX = currentX - touchStartX.current;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (!showIngOverlay && !showTipsOverlay) {
        if (deltaX < -70) { nextStep(); swipeHandled.current = true; }
        else if (deltaX > 70) { prevStep(); swipeHandled.current = true; }
      }
    } else {
      if (showIngOverlay) {
        if (deltaY > 70 && ingScrollRef.current && ingScrollRef.current.scrollTop <= 0) {
          setShowIngOverlay(false); swipeHandled.current = true;
        }
      } else if (showTipsOverlay) {
        if (deltaY < -70) { setShowTipsOverlay(false); swipeHandled.current = true; }
      } else {
        if (deltaY < -80) { setShowIngOverlay(true); swipeHandled.current = true; }
        if (deltaY > 80) { setShowTipsOverlay(true); swipeHandled.current = true; }
      }
    }
  };

  // --- Improved Air Gesture Engine: Centroid Velocity Tracking ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 160, height: 120, facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setAirGesturesEnabled(false);
      }
    };

    const processFrame = () => {
      if (!videoRef.current || !canvasRef.current || !airGesturesEnabled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      if (prevFrameRef.current) {
        const prevFrame = prevFrameRef.current;
        const width = canvas.width;
        const height = canvas.height;
        const threshold = 35; 
        
        let motionPixels = 0;
        let sumX = 0;

        for (let y = 0; y < height; y += 2) {
          for (let x = 0; x < width; x += 2) {
            const i = (y * width + x) * 4;
            const diff = Math.abs(currentFrame[i] - prevFrame[i]);
            
            if (diff > threshold) {
              motionPixels++;
              sumX += x;
            }
          }
        }

        const now = Date.now();
        const minMotionMass = 200; 
        const gestureSensitivity = 25; 
        const decay = 0.85; 

        if (motionPixels > minMotionMass) {
          const currentCentroidX = sumX / motionPixels;
          
          if (lastCentroidX.current !== null) {
            const deltaX = currentCentroidX - lastCentroidX.current;
            if (Math.abs(deltaX) > 1) {
              accumulatedVelocity.current += deltaX;
            }
          }
          lastCentroidX.current = currentCentroidX;
        } else {
          accumulatedVelocity.current *= decay;
          lastCentroidX.current = null;
        }

        if (now - lastGestureTime.current > 1100) {
          if (accumulatedVelocity.current < -gestureSensitivity) {
            nextStep();
            lastGestureTime.current = now;
            accumulatedVelocity.current = 0;
          } else if (accumulatedVelocity.current > gestureSensitivity) {
            prevStep();
            lastGestureTime.current = now;
            accumulatedVelocity.current = 0;
          }
        }
        
        if (Math.abs(accumulatedVelocity.current) > 100) {
          accumulatedVelocity.current *= 0.5;
        }
      }

      prevFrameRef.current = currentFrame;
      animationId = requestAnimationFrame(processFrame);
    };

    if (airGesturesEnabled && isHandsFree) {
      startCamera().then(() => {
        animationId = requestAnimationFrame(processFrame);
      });
    } else {
      if (stream) stream.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
      cancelAnimationFrame(animationId);
      accumulatedVelocity.current = 0;
      lastCentroidX.current = null;
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animationId);
    };
  }, [airGesturesEnabled, isHandsFree, nextStep, prevStep]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isHandsFree) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'Escape') {
        if (showIngOverlay) setShowIngOverlay(false);
        else if (showTipsOverlay) setShowTipsOverlay(false);
        else setIsHandsFree(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHandsFree, showIngOverlay, showTipsOverlay, nextStep, prevStep]);

  const handleCartToggle = () => {
    if (isInCart && cartItem) onRemoveFromCart(cartItem.id);
    else onAddToCart(recipe, scalingFactor);
  };

  const updateField = (field: keyof Recipe, value: any) => {
    setRecipe(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...recipe.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    updateField('ingredients', updated);
  };

  const removeIngredient = (index: number) => {
    updateField('ingredients', recipe.ingredients.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    updateField('ingredients', [...recipe.ingredients, { name: '', quantity: 1, unit: 'g' }]);
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...recipe.instructions];
    updated[index] = value;
    updateField('instructions', updated);
  };

  const removeInstruction = (index: number) => {
    updateField('instructions', recipe.instructions.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    updateField('instructions', [...recipe.instructions, '']);
  };

  const updateTip = (index: number, value: string) => {
    const updated = [...(recipe.extractedTips || [])];
    updated[index] = value;
    updateField('extractedTips', updated);
  };

  const removeTip = (index: number) => {
    updateField('extractedTips', (recipe.extractedTips || []).filter((_, i) => i !== index));
  };

  const addTip = () => {
    updateField('extractedTips', [...(recipe.extractedTips || []), '']);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const compressed = await compressImage(ev.target.result as string);
          updateField('coverImage', compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProportionalScale = (index: number, newVal: string) => {
    setTempScaleValue(newVal);
    const originalQty = recipe.ingredients[index].quantity;
    const parsedVal = parseFloat(newVal);
    if (!isNaN(parsedVal) && originalQty > 0) {
      const newFactor = parsedVal / originalQty;
      setScalingFactor(Math.min(Math.max(newFactor, 0.01), 100));
    }
  };

  const SectionHeader = ({ icon: Icon, title, extra }: { icon: any, title: string, extra?: React.ReactNode }) => (
    <div className="h-10 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between px-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] shrink-0 rounded-t-xl transition-colors">
      <div className="flex items-center gap-2 text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5 text-[#0b57d0] dark:text-[#8ab4f8]" />
        <span>{title}</span>
      </div>
      {extra}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={close}></div>
      
      <div className="relative bg-[#f8f9fa] dark:bg-[#0f1114] w-full max-w-7xl h-[94vh] sm:h-[90vh] sm:rounded-xl overflow-hidden flex flex-col border border-[#dadce0] dark:border-[#3c4043] shadow-2xl transition-colors animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
        
        {/* Header Bar */}
        <header className="h-14 border-b border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#1b1b1b] flex items-center justify-between px-6 shrink-0 z-50 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden md:inline text-[13px] text-[#444746] dark:text-[#8e918f] font-medium">Cookbook</span>
            <span className="hidden md:inline text-[#bdc1c6] dark:text-[#5f6368] text-sm">/</span>
            <span className="text-[15px] font-bold text-[#1f1f1f] dark:text-[#e3e3e3] truncate google-sans">
              {recipe.title || 'Untitled Adapter'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button 
                onClick={() => setIsHandsFree(!isHandsFree)}
                title="Hands-free Mode"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  isHandsFree 
                    ? 'text-[#0b57d0] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#2d2e30]' 
                    : 'text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30]'
                }`}
              >
                {isHandsFree ? <Minimize2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="hidden sm:inline">{isHandsFree ? 'Exit Presentation' : 'Hands-free'}</span>
              </button>
            )}

            {!isEditing && !isHandsFree && (
              <button 
                onClick={handleCartToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  isInCart ? 'text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40' : 'text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] border border-transparent'
                }`}
              >
                {isInCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                <span className="hidden sm:inline">{isInCart ? 'Stored' : 'Store'}</span>
              </button>
            )}

            {!isHandsFree && (
              <button 
                onClick={() => isEditing ? (recipe.id ? updateRecipe() : saveRecipe()) : setIsEditing(true)}
                disabled={saving}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  isEditing ? 'text-[#0b57d0] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#2d2e30] border border-[#d2e3fc] dark:border-[#3c4043]' : 'text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] border border-transparent'
                }`}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isEditing ? 'Commit' : 'Edit'}</span>
              </button>
            )}

            <div className="w-px h-6 bg-[#dadce0] dark:bg-[#3c4043] mx-1"></div>

            <button onClick={close} className="p-2 hover:bg-[#ffdad6] dark:hover:bg-red-900/30 hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] rounded-lg transition-all text-[#444746] dark:text-[#c4c7c5]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Presentation Mode / Standard Workspace Content */}
        {isHandsFree ? (
          <div 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="flex-1 relative flex flex-col bg-white dark:bg-[#0f1114] transition-colors overflow-hidden select-none"
          >
            {/* Gesture Feedback Layer */}
            {gestureFeedback === 'left' && (
              <div className="absolute left-0 inset-y-0 w-24 bg-gradient-to-r from-[#0b57d0]/10 to-transparent z-[56] flex items-center justify-center animate-pulse">
                <ChevronLeft className="w-12 h-12 text-[#0b57d0] opacity-30" />
              </div>
            )}
            {gestureFeedback === 'right' && (
              <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#0b57d0]/10 to-transparent z-[56] flex items-center justify-center animate-pulse">
                <ChevronRight className="w-12 h-12 text-[#0b57d0] opacity-30" />
              </div>
            )}

            {/* Hands-free Control Hub */}
            <div className="absolute top-4 right-4 z-[55] flex flex-col items-end gap-2">
              <div className="flex gap-2">
                {/* Stay Awake Status */}
                {isWakeLockActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 shadow-sm animate-in fade-in slide-in-from-top-1">
                    <SunMedium className="w-3 h-3 animate-pulse" />
                    Stay Awake Active
                  </div>
                )}

                <button 
                  onClick={() => setAirGesturesEnabled(!airGesturesEnabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                    airGesturesEnabled 
                      ? 'bg-[#e8f0fe] text-[#0b57d0] border border-[#d2e3fc]' 
                      : 'bg-white/80 dark:bg-[#1b1b1b]/80 text-[#444746] dark:text-[#8e918f] border border-[#dadce0] dark:border-[#3c4043]'
                  }`}
                >
                  {airGesturesEnabled ? <Camera className="w-3 h-3" /> : <CameraOff className="w-3 h-3" />}
                  {airGesturesEnabled ? 'Air Gestures On' : 'Air Gestures Off'}
                </button>
              </div>
              
              {airGesturesEnabled && (
                <div className="p-1 bg-black/40 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 flex flex-col items-center animate-in slide-in-from-right-4">
                  <video ref={videoRef} autoPlay playsInline muted className="w-24 h-18 object-cover rounded scale-x-[-1]" />
                  <canvas ref={canvasRef} width="160" height="120" className="hidden" />
                  
                  {/* Visual Velocity Indicator */}
                  <div className="w-full h-1 bg-white/20 mt-1 relative overflow-hidden">
                    <div 
                      className={`absolute h-full transition-all duration-75 ${accumulatedVelocity.current > 0 ? 'bg-amber-400' : 'bg-[#0b57d0]'}`}
                      style={{ 
                        left: '50%',
                        width: `${Math.min(Math.abs(accumulatedVelocity.current) * 2, 50)}%`,
                        transform: accumulatedVelocity.current < 0 ? 'translateX(-100%)' : 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Top Trigger: Tips & Insights */}
            <button 
              onClick={() => setShowTipsOverlay(true)}
              className="absolute top-0 left-1/2 -translate-x-1/2 px-6 py-2 bg-[#f8f9fa] dark:bg-[#1b1b1b] border-x border-b border-[#dadce0] dark:border-[#3c4043] rounded-b-2xl text-[11px] font-bold text-[#444746] dark:text-[#8e918f] uppercase tracking-widest flex items-center gap-2 hover:text-[#0b57d0] dark:hover:text-[#8ab4f8] transition-all z-40 group shadow-sm"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Observations & Insights
              <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
            </button>

            {/* Presentation Slider Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 text-center">
              <div className="max-w-4xl space-y-12 animate-in zoom-in-95 duration-500">
                <div className="space-y-4">
                  <span className="text-[14px] md:text-[18px] font-mono font-bold text-[#bdc1c6] dark:text-[#5f6368] uppercase tracking-[0.2em]">
                    Step {currentStep + 1} of {recipe.instructions.length}
                  </span>
                  <div className="w-24 h-1 bg-[#0b57d0] mx-auto rounded-full"></div>
                </div>

                <h2 className="text-2xl md:text-5xl lg:text-6xl font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans leading-tight transition-all duration-300">
                  {recipe.instructions[currentStep]}
                </h2>
                
                <div className="flex items-center justify-center gap-8 pt-12">
                  <button 
                    disabled={currentStep === 0}
                    onClick={prevStep}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#f8f9fa] dark:bg-[#1b1b1b] border border-[#dadce0] dark:border-[#3c4043] flex items-center justify-center text-[#444746] dark:text-[#c4c7c5] hover:bg-[#e8f0fe] dark:hover:bg-[#2d2e30] hover:text-[#0b57d0] dark:hover:text-[#8ab4f8] disabled:opacity-30 disabled:pointer-events-none transition-all shadow-md active:scale-90"
                  >
                    <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
                  </button>
                  <button 
                    disabled={currentStep === recipe.instructions.length - 1}
                    onClick={nextStep}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#0b57d0] flex items-center justify-center text-white hover:bg-[#0842a0] disabled:bg-[#bdc1c6] dark:disabled:bg-[#2d2e30] transition-all shadow-lg active:scale-90"
                  >
                    <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
                  </button>
                </div>
                
                <div className="flex items-center justify-center gap-6 pt-6 opacity-60">
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8e918f]">
                      <ArrowRightLeft className="w-3 h-3" /> Swipe
                   </div>
                   <div className="w-px h-3 bg-[#dadce0] dark:bg-[#3c4043]"></div>
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0b57d0] dark:text-[#8ab4f8]">
                      <Waves className="w-3 h-3" /> Wave Hand to Flip
                   </div>
                </div>
              </div>
            </div>

            {/* Bottom Trigger: Ingredients */}
            <button 
              onClick={() => setShowIngOverlay(true)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 px-6 py-3 bg-white dark:bg-[#1b1b1b] border-x border-t border-[#dadce0] dark:border-[#3c4043] rounded-t-2xl text-[11px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] uppercase tracking-widest flex items-center gap-2 hover:bg-[#e8f0fe] dark:hover:bg-[#2d2e30] transition-all z-40 group shadow-lg"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              View Ingredients
              <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {/* Pull-down Panel: Tips & Insights */}
            <div className={`absolute inset-x-0 top-0 h-full bg-white/95 dark:bg-[#0f1114]/95 backdrop-blur-md z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${showTipsOverlay ? 'translate-y-0' : '-translate-y-full'}`}>
              <div className="h-14 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  Observations & Insights
                </div>
                <button onClick={() => setShowTipsOverlay(false)} className="p-2 hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] rounded-full transition-colors">
                  <X className="w-5 h-5 text-[#444746] dark:text-[#8e918f]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8">
                  <section>
                    <h3 className="text-[11px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-widest mb-4">Recipe Observations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recipe.extractedTips?.map((tip, idx) => (
                        <div key={idx} className="p-4 bg-[#f8f9fa] dark:bg-[#1b1b1b] rounded-xl border border-[#dadce0] dark:border-[#3c4043] text-[14px] leading-relaxed text-[#1f1f1f] dark:text-[#e3e3e3]">
                          {tip}
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-[11px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-widest mb-4">AI Adaptations</h3>
                    <div className="space-y-3">
                      {recipe.aiSuggestions?.map((s, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border border-[#d2e3fc] dark:border-[#0b57d0]/20 bg-[#e8f0fe]/30 dark:bg-[#0b57d0]/10 rounded-xl items-start">
                          <Sparkles className="w-5 h-5 text-[#0b57d0] dark:text-[#8ab4f8] shrink-0" />
                          <p className="text-[14px] text-[#1f1f1f] dark:text-[#e3e3e3] leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Pull-up Panel: Ingredients */}
            <div 
              className={`absolute inset-x-0 bottom-0 h-[85%] bg-white dark:bg-[#1b1b1b] border-t border-[#dadce0] dark:border-[#3c4043] z-50 transform transition-transform duration-500 ease-in-out flex flex-col shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-3xl ${showIngOverlay ? 'translate-y-0' : 'translate-y-full'}`}
            >
              <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-12 h-1.5 bg-[#dadce0] dark:bg-[#3c4043] rounded-full"></div>
              </div>

              <div className="h-14 border-b border-[#dadce0] dark:border-[#3c4043] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] uppercase tracking-wider">
                  <ClipboardList className="w-4 h-4" />
                  Ingredients List ({scalingFactor}x scale)
                </div>
                <button onClick={() => setShowIngOverlay(false)} className="p-2 hover:bg-[#f1f3f4] dark:hover:bg-[#2d2e30] rounded-full transition-colors">
                  <X className="w-5 h-5 text-[#444746] dark:text-[#8e918f]" />
                </button>
              </div>
              <div ref={ingScrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:px-12 md:py-8 overscroll-contain">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border-b border-[#f1f3f4] dark:border-[#3c4043] last:border-none">
                      <span className="text-[16px] font-medium text-[#1f1f1f] dark:text-[#e3e3e3]">{ing.name}</span>
                      <span className="text-[15px] font-bold font-mono text-[#0b57d0] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#2d2e30] px-3 py-1 rounded-lg">
                        {formatQty(ing.quantity * scalingFactor)} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-[#f8f9fa] dark:bg-[#0f1114] flex justify-center border-t border-[#dadce0] dark:border-[#3c4043] shrink-0">
                <button 
                  onClick={() => setShowIngOverlay(false)}
                  className="bg-[#0b57d0] text-white px-8 py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform"
                >
                  Close Specification
                </button>
              </div>
            </div>

            <div className="absolute top-0 left-0 h-1 bg-[#0b57d0] transition-all duration-300 z-[55]" style={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }}></div>
          </div>
        ) : (
          /* Standard Scrollable Workspace (unchanged) */
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="studio-card p-4 bg-white dark:bg-[#1b1b1b] flex flex-row gap-4 items-start border-[#dadce0] dark:border-[#3c4043] transition-colors">
                    <div 
                      className="w-24 h-24 sm:w-32 sm:h-32 bg-[#f1f3f4] dark:bg-[#0f1114] rounded-lg border border-[#dadce0] dark:border-[#3c4043] overflow-hidden flex items-center justify-center relative cursor-pointer group shrink-0"
                      onClick={() => {
                        if (isEditing) {
                          if (recipe.coverImage) updateField('coverImage', null);
                          else fileInputRef.current?.click();
                        }
                      }}
                    >
                      {recipe.coverImage ? (
                        <img src={recipe.coverImage} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 opacity-40 dark:opacity-60">
                          <span className="text-3xl sm:text-4xl">{recipe.emoji || '🥘'}</span>
                        </div>
                      )}
                      {isEditing && (
                        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] ${recipe.coverImage ? 'bg-black/40' : 'bg-black/30'}`}>
                          {recipe.coverImage ? <Trash2 className="text-white w-6 h-6" /> : <UploadCloud className="text-white w-6 h-6" />}
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {isEditing ? (
                        <input 
                          value={recipe.title} onChange={(e) => updateField('title', e.target.value)}
                          className="text-base font-bold w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg px-3 py-1.5 focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] outline-none google-sans text-[#1f1f1f] dark:text-white"
                          placeholder="Adapter Title"
                        />
                      ) : (
                        <h2 className="text-lg font-bold text-[#1f1f1f] dark:text-[#e3e3e3] google-sans px-1 leading-tight truncate">{recipe.title}</h2>
                      )}
                      
                      {isEditing ? (
                        <textarea 
                          value={recipe.summary} onChange={(e) => updateField('summary', e.target.value)}
                          className="text-[12px] w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg p-2.5 outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] text-[#1f1f1f] dark:text-white resize-none"
                          rows={2} placeholder="Describe this adaptation..."
                        />
                      ) : (
                        <p className="text-[12px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed italic border-l-2 border-[#0b57d0] dark:border-[#8ab4f8] pl-3 py-0.5 line-clamp-3 transition-colors">
                          {recipe.summary}
                        </p>
                      )}

                      {isEditing ? (
                        <div className="relative group/url">
                          <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#bdc1c6] dark:text-[#5f6368]" />
                          <input 
                            value={recipe.sourceUrl || ''} 
                            onChange={(e) => updateField('sourceUrl', e.target.value)}
                            className="text-[11px] w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] font-mono text-[#1f1f1f] dark:text-white"
                            placeholder="Source URL (optional)"
                          />
                        </div>
                      ) : recipe.sourceUrl && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#0b57d0] dark:text-[#8ab4f8] hover:underline truncate px-1 transition-colors">
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <a href={recipe.sourceUrl.startsWith('http') ? recipe.sourceUrl : `https://${recipe.sourceUrl}`} target="_blank" rel="noopener noreferrer" className="truncate">{recipe.sourceUrl}</a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="studio-card bg-white dark:bg-[#1b1b1b] overflow-hidden border-[#dadce0] dark:border-[#3c4043] transition-colors">
                    <SectionHeader 
                      icon={ShoppingBasket} 
                      title="Ingredients Specification" 
                      extra={!isEditing && (
                        <div className="flex items-center gap-2 bg-[#e8f0fe] dark:bg-[#2d2e30] px-3 py-1 rounded-lg text-[10px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] border border-[#d2e3fc] dark:border-[#3c4043] transition-colors">
                          <Scale className="w-3.5 h-3.5" /> {formatQty(scalingFactor)}x
                        </div>
                      )}
                    />
                    {!isEditing && (
                      <div className="px-5 py-2 bg-[#f8f9fa] dark:bg-[#0f1114] border-b border-[#dadce0] dark:border-[#3c4043] flex items-center gap-2 transition-colors">
                         <ArrowRightLeft className="w-3 h-3 text-[#0b57d0] dark:text-[#8ab4f8]" />
                         <span className="text-[10px] font-bold text-[#8e918f] dark:text-[#5f6368] uppercase tracking-tight">Click any quantity to scale proportionally</span>
                      </div>
                    )}
                    <div className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
                      {recipe.ingredients.map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[#f8f9fa] dark:hover:bg-[#2d2e30] transition-colors group">
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <input value={ing.name} onChange={(e) => updateIngredient(idx, 'name', e.target.value)} className="w-full text-[14px] font-medium bg-transparent outline-none focus:text-[#0b57d0] dark:focus:text-[#8ab4f8] text-[#1f1f1f] dark:text-[#e3e3e3]" placeholder="Item Name" />
                            ) : (
                              <span className="text-[14px] font-medium text-[#1f1f1f] dark:text-[#e3e3e3] truncate transition-colors">{ing.name}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 transition-all min-w-[70px] justify-center ${isEditing ? 'bg-[#f8f9fa] dark:bg-[#0f1114] border-[#dadce0] dark:border-[#3c4043]' : activeScaleIndex === idx ? 'bg-white dark:bg-[#1b1b1b] border-[#0b57d0] dark:border-[#8ab4f8] ring-1 ring-[#0b57d0]/20 dark:ring-[#8ab4f8]/20' : 'bg-[#e8f0fe] dark:bg-[#2d2e30] border-[#d2e3fc] dark:border-[#3c4043] cursor-pointer hover:border-[#0b57d0] dark:hover:border-[#8ab4f8]'}`}>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input type="number" step="any" value={ing.quantity} onChange={(e) => updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-10 text-right bg-transparent outline-none font-bold text-[#0b57d0] dark:text-[#8ab4f8] text-[13px]" />
                                  <input value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)} className="w-8 bg-transparent outline-none text-[#444746] dark:text-[#8e918f] text-[11px] font-mono" />
                                </div>
                              ) : activeScaleIndex === idx ? (
                                <div className="flex items-center gap-1">
                                  <input autoFocus type="number" step="any" value={tempScaleValue} onChange={(e) => handleProportionalScale(idx, e.target.value)} onBlur={() => setActiveScaleIndex(null)} onKeyDown={(e) => e.key === 'Enter' && setActiveScaleIndex(null)} className="w-12 text-right bg-transparent outline-none font-bold text-[#0b57d0] dark:text-[#8ab4f8] text-[13px]" />
                                  <span className="text-[#8e918f] dark:text-[#5f6368] text-[11px] font-mono lowercase">{ing.unit}</span>
                                </div>
                              ) : (
                                <span className="text-[13px] font-bold text-[#0b57d0] dark:text-[#8ab4f8] font-mono whitespace-nowrap transition-colors">{formatQty(ing.quantity * scalingFactor)} <span className="text-[#8e918f] dark:text-[#5f6368] font-normal lowercase">{ing.unit}</span></span>
                              )}
                            </div>
                            {isEditing && <button onClick={() => removeIngredient(idx)} className="text-[#bdc1c6] dark:text-[#5f6368] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] p-1.5 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <button onClick={addIngredient} className="w-full py-3 bg-[#f8f9fa] dark:bg-[#0f1114] text-[#0b57d0] dark:text-[#8ab4f8] text-[11px] font-bold uppercase hover:bg-[#e8f0fe] dark:hover:bg-[#2d2e30] transition-all flex items-center justify-center gap-2 border-t border-[#dadce0] dark:border-[#3c4043]">
                        <Plus className="w-4 h-4" /> Add Line Item
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="studio-card bg-white dark:bg-[#1b1b1b] overflow-hidden border-[#dadce0] dark:border-[#3c4043] transition-colors">
                    <SectionHeader icon={ChefHat} title="Execution Workflow" />
                    <div className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
                      {recipe.instructions.map((step, i) => (
                        <div key={i} className="flex group last:border-none hover:bg-[#fcfdfe] dark:hover:bg-[#2d2e30] transition-colors">
                          <div className="w-12 sm:w-16 shrink-0 flex flex-col items-center pt-6 bg-[#f8f9fa] dark:bg-[#0f1114] border-r border-[#f1f3f4] dark:border-[#3c4043] transition-colors">
                            <span className="text-[11px] font-mono font-bold text-[#bdc1c6] dark:text-[#5f6368]">{String(i + 1).padStart(2, '0')}</span>
                          </div>
                          <div className="flex-1 p-5 sm:p-6 min-w-0">
                            {isEditing ? (
                              <textarea value={step} onChange={(e) => updateInstruction(i, e.target.value)} className="w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg p-4 text-[13px] outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] shadow-inner text-[#1f1f1f] dark:text-white" rows={3} />
                            ) : (
                              <p className="text-[14px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed transition-colors">{step}</p>
                            )}
                          </div>
                          {isEditing && (
                            <div className="pr-4 pt-6">
                              <button onClick={() => removeInstruction(i)} className="text-[#bdc1c6] dark:text-[#5f6368] hover:text-[#ba1a1a] dark:hover:text-[#ffb4ab] p-2 rounded-lg hover:bg-[#ffdad6] dark:hover:bg-red-900/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                      ))}
                      {isEditing && (
                        <button onClick={addInstruction} className="w-full py-5 bg-[#f8f9fa] dark:bg-[#0f1114] border-t border-[#dadce0] dark:border-[#3c4043] text-[#0b57d0] dark:text-[#8ab4f8] text-[11px] font-bold uppercase hover:bg-[#e8f0fe] dark:hover:bg-[#2d2e30] transition-all flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Insert Task Block
                        </button>
                      )}
                    </div>
                  </div>

                  {(isEditing || (recipe.extractedTips && recipe.extractedTips.length > 0)) && (
                    <div className="studio-card bg-white dark:bg-[#1b1b1b] overflow-hidden border-[#dadce0] dark:border-[#3c4043] transition-colors">
                      <SectionHeader icon={Info} title="Recipe Observations" />
                      <div className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
                        {(recipe.extractedTips || []).map((tip, idx) => (
                          <div key={idx} className="flex group hover:bg-[#fcfdfe] dark:hover:bg-[#2d2e30] transition-colors items-start">
                            <div className="w-12 sm:w-16 shrink-0 flex flex-col items-center pt-5 bg-[#f8f9fa] dark:bg-[#0f1114] border-r border-[#f1f3f4] dark:border-[#3c4043] h-full self-stretch transition-colors">
                              <Info className="w-4 h-4 text-[#bdc1c6] dark:text-[#5f6368]" />
                            </div>
                            <div className="flex-1 p-5 min-w-0">
                              {isEditing ? (
                                <textarea value={tip} onChange={(e) => updateTip(idx, e.target.value)} className="w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-lg p-3 text-[13px] outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] shadow-inner text-[#1f1f1f] dark:text-white" rows={2} />
                              ) : (
                                <p className="text-[13px] text-[#444746] dark:text-[#c4c7c5] leading-relaxed transition-colors">{tip}</p>
                              )}
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
                    <SectionHeader icon={Sparkles} title="Culinary Insights & Adaptations" />
                    <div className="divide-y divide-[#f1f3f4] dark:divide-[#3c4043]">
                      {(recipe.aiSuggestions || []).map((tip, idx) => (
                        <div key={idx} className="flex group hover:bg-[#fcfdfe] dark:hover:bg-[#2d2e30] transition-colors items-start">
                          <div className="w-12 sm:w-16 shrink-0 flex flex-col items-center pt-5 border-r border-[#f1f3f4] dark:border-[#3c4043] h-full self-stretch transition-colors">
                            <Sparkles className="w-4 h-4 text-[#0b57d0] dark:text-[#8ab4f8]" />
                          </div>
                          <div className="flex-1 p-5 min-w-0">
                             <p className="text-[13px] text-[#1f1f1f] dark:text-[#e3e3e3] leading-relaxed transition-colors">{tip}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-32"></div>
            </div>
          </div>
        )}

        {!isEditing && !isHandsFree && (
          <div className="shrink-0 p-4 bg-white/90 dark:bg-[#1b1b1b]/90 backdrop-blur-md border-t border-[#dadce0] dark:border-[#3c4043] z-50 transition-colors">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <div className="relative flex-1 group">
                <textarea 
                  value={refinePrompt} 
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), refine())}
                  placeholder="Refine this adapter..."
                  className="w-full bg-[#f8f9fa] dark:bg-[#0f1114] border border-[#dadce0] dark:border-[#3c4043] rounded-xl px-5 py-3.5 pr-14 text-[13px] outline-none focus:border-[#0b57d0] dark:focus:border-[#8ab4f8] transition-all shadow-inner resize-none h-[54px] overflow-hidden leading-[22px] text-[#1f1f1f] dark:text-white"
                />
                <button 
                  onClick={refine} 
                  disabled={refining || !refinePrompt.trim()}
                  className="absolute right-2 top-2 p-2.5 bg-[#0b57d0] dark:bg-[#0b57d0] text-white rounded-lg hover:bg-[#0842a0] disabled:bg-[#f1f3f4] dark:disabled:bg-[#2d2e30] disabled:text-[#bdc1c6] dark:disabled:text-[#5f6368] transition-all active:scale-90"
                >
                  {refining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeModal;