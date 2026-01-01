
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRecipeContext } from '../../context/RecipeContext';
import { useVoiceControl, VoiceCommand } from '../useVoiceControl';
import { useWakeLock } from '../useDevice';

interface ActiveTimer {
  total: number;
  remaining: number;
  label: string;
  status: 'running' | 'paused' | 'done';
}

export function useMakeController() {
  const { activeRecipe: recipe, setIsHandsFree } = useRecipeContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [activeCommand, setActiveCommand] = useState<{ cmd: VoiceCommand, label: string } | null>(null);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  const isWakeLockActive = useWakeLock();
  
  // Ref for circular dependency
  const commandHandlerRef = useRef<((command: VoiceCommand, text: string) => void) | null>(null);

  // --- ACTIONS ---
  const closeView = () => setIsHandsFree(false);

  const nextStep = useCallback(() => {
    if (recipe && currentStep < recipe.instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentStep, recipe]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      return true;
    }
    return false;
  }, [currentStep]);

  // --- HELPERS ---
  const parseFuzzyNumber = (str: string): number => {
    if (/^[\d\.]+$/.test(str)) return parseFloat(str);
    if (str === '半') return 0.5;
    const map: Record<string, number> = {
        '零': 0, '一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, 
        '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '百': 100
    };
    let total = 0, current = 0;
    for (const char of str) {
        const val = map[char];
        if (val === undefined) continue;
        if (val === 10 || val === 100) {
            if (current === 0) current = 1;
            total += current * val;
            current = 0;
        } else {
            current = val;
        }
    }
    return total + current;
  };

  const parseDurationToSeconds = (numRaw: string | number, unit: string) => {
    const num = typeof numRaw === 'string' ? parseFuzzyNumber(numRaw) : numRaw;
    const u = unit.toLowerCase();
    if (u.startsWith('min') || u.includes('分')) return num * 60;
    if (u.startsWith('hour') || u.startsWith('hr') || u.includes('小')) return num * 3600;
    if (u.startsWith('sec') || u.includes('秒')) return num;
    return 0;
  };

  const findDurationInText = (text: string) => {
     // Prioritize full words to prevent 'minutes' matching as 'min' and leaving 'utes'
     const regex = /([0-9\.]+|[零一二兩三四五六七八九十百半]+)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?|分鐘|分|小時|秒鐘|秒)/i;
     const match = regex.exec(text);
     if (match) {
        return { seconds: parseDurationToSeconds(match[1], match[2]), label: match[0] };
     }
     return null;
  };

  const startSmartTimer = (seconds: number, label: string) => {
    setActiveTimer({ total: seconds, remaining: seconds, label, status: 'running' });
  };

  const toggleTimer = () => {
    if (!activeTimer) return;
    setActiveTimer(prev => prev ? ({ ...prev, status: prev.status === 'running' ? 'paused' : 'running' }) : null);
  };

  const stopTimer = () => setActiveTimer(null);

  // --- VOICE CONTROL ---
  const showFeedback = (cmd: VoiceCommand, label: string) => {
    setActiveCommand({ cmd, label });
    setTimeout(() => setActiveCommand(null), 1000);
  };

  const { isListening, isSpeaking, toggleListening, transcript, speak, cancel } = useVoiceControl({ 
    onCommand: (command, text) => {
      if (commandHandlerRef.current) commandHandlerRef.current(command, text);
    }
  });

  const handleVoiceCommand = useCallback((command: VoiceCommand, _text: string) => {
    if (!recipe) return;
    switch (command) {
      case 'NEXT_STEP':
        if (showIngredients) setShowIngredients(false);
        if (showTips) setShowTips(false);
        if (nextStep()) showFeedback('NEXT_STEP', 'Next Step');
        else speak("That was the last step.");
        break;
      case 'PREV_STEP':
        if (showIngredients) setShowIngredients(false);
        if (showTips) setShowTips(false);
        if (prevStep()) showFeedback('PREV_STEP', 'Previous Step');
        else speak("You are at the first step.");
        break;
      case 'READ_CURRENT':
        if (showIngredients) setShowIngredients(false);
        if (showTips) setShowTips(false);
        showFeedback('READ_CURRENT', 'Reading...');
        speak(recipe.instructions[currentStep]);
        break;
      case 'READ_INGREDIENTS':
        showFeedback('READ_INGREDIENTS', 'Ingredients');
        setShowIngredients(true);
        const ingText = recipe.ingredients.map(i => `${i.quantity} ${i.unit} of ${i.name}`).join('. ');
        speak(`You need: ${ingText}`);
        break;
      case 'START_TIMER':
        const found = findDurationInText(recipe.instructions[currentStep]);
        if (found) {
            startSmartTimer(found.seconds, found.label);
            showFeedback('START_TIMER', 'Timer Started');
            speak(`Starting timer for ${found.label}`);
        } else {
            speak("I didn't find a timer in this step.");
        }
        break;
      case 'STOP_TIMER':
        if (activeTimer) {
            stopTimer();
            showFeedback('STOP_TIMER', 'Timer Stopped');
            speak("Timer stopped");
        } else speak("There is no active timer.");
        break;
      case 'PAUSE_TIMER':
        if (activeTimer?.status === 'running') {
             toggleTimer();
             showFeedback('PAUSE_TIMER', 'Paused');
        }
        break;
      case 'RESUME_TIMER':
        if (activeTimer?.status === 'paused') {
             toggleTimer();
             showFeedback('RESUME_TIMER', 'Resumed');
        }
        break;
      case 'STOP_TTS':
        showFeedback('STOP_TTS', 'Silence');
        cancel();
        break;
    }
  }, [nextStep, prevStep, currentStep, recipe, speak, cancel, showIngredients, showTips, activeTimer]);

  useEffect(() => { commandHandlerRef.current = handleVoiceCommand; }, [handleVoiceCommand]);

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (activeTimer?.status === 'running' && activeTimer.remaining > 0) {
      interval = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev) return null;
          if (prev.remaining <= 1) return { ...prev, remaining: 0, status: 'done' };
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer?.status]);

  // Timer Announce
  useEffect(() => {
    if (activeTimer?.status === 'done') {
        const isChinese = /[\u4e00-\u9fa5]/.test(activeTimer.label);
        speak(isChinese ? `${activeTimer.label} 時間到` : `${activeTimer.label} timer finished`);
    }
  }, [activeTimer?.status, activeTimer?.label, speak]);

  // Auto-Read Step
  useEffect(() => {
    if (isListening && recipe) {
      const timer = setTimeout(() => speak(recipe.instructions[currentStep]), 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentStep, isListening, recipe, speak]);

  return {
    state: { recipe, currentStep, showIngredients, showTips, activeCommand, activeTimer, isListening, isSpeaking, transcript, isWakeLockActive },
    actions: { nextStep, prevStep, toggleListening, setShowIngredients, setShowTips, closeView, speak, startSmartTimer, toggleTimer, stopTimer, parseDurationToSeconds }
  };
}
