
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRecipeSessionContext } from '../../context/RecipeSessionContext';
import { useVoiceControl, VoiceCommand } from '../useVoiceControl';
import { useWakeLock } from '../useDevice';
import { Ingredient } from '../../types';
import { findDurationInText, parseDurationToSeconds } from '../../utils/parsers';

export interface ActiveTimer {
  total: number;
  endsAt: number; // Replaces 'remaining' with a fixed end timestamp
  label: string;
  status: 'running' | 'paused' | 'done';
}

export interface CookingSessionProps {
  recipe: {
    instructions: string[];
    ingredients: Ingredient[];
    extractedTips?: string[];
    aiSuggestions?: string[];
  } | null;
  onClose: () => void;
}

// GENERIC HOOK: Decoupled from Context
export function useCookingSession({ recipe, onClose }: CookingSessionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [activeCommand, setActiveCommand] = useState<{ cmd: VoiceCommand, label: string } | null>(null);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  const isWakeLockActive = useWakeLock();
  
  // Ref for circular dependency
  const commandHandlerRef = useRef<((command: VoiceCommand, text: string) => void) | null>(null);

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

  const startSmartTimer = (seconds: number, label: string) => {
    // Safety check: ensure seconds is a valid positive number
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    
    setActiveTimer({ 
      total: seconds, 
      endsAt: Date.now() + (seconds * 1000), 
      label, 
      status: 'running' 
    });
  };

  const toggleTimer = () => {
    if (!activeTimer) return;
    
    if (activeTimer.status === 'running') {
      // Pause: Save remaining time by calculating a fake "endsAt" for when we resume
      const remainingMs = Math.max(0, activeTimer.endsAt - Date.now());
      setActiveTimer({ ...activeTimer, status: 'paused', endsAt: remainingMs });
    } else {
      // Resume: 'endsAt' currently holds remaining ms. Convert to future timestamp.
      setActiveTimer({ ...activeTimer, status: 'running', endsAt: Date.now() + activeTimer.endsAt });
    }
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

  // Timer Completion Check (Replacing the interval)
  useEffect(() => {
    if (activeTimer?.status === 'running') {
      const timeRemaining = activeTimer.endsAt - Date.now();
      
      if (timeRemaining <= 0) {
        // Already done
        setActiveTimer(prev => prev ? { ...prev, status: 'done', endsAt: 0 } : null);
      } else {
        // Set a timeout for the exact end time
        const timerId = setTimeout(() => {
           setActiveTimer(prev => prev ? { ...prev, status: 'done', endsAt: 0 } : null);
        }, timeRemaining);
        return () => clearTimeout(timerId);
      }
    }
    // Explicit return to satisfy TS7030
    return undefined;
  }, [activeTimer?.status, activeTimer?.endsAt]);

  // Timer Announce
  useEffect(() => {
    if (activeTimer?.status === 'done') {
        const isChinese = /[\u4e00-\u9fa5]/.test(activeTimer.label);
        speak(isChinese ? `${activeTimer.label} 時間到` : `${activeTimer.label} timer finished`);
    }
  }, [activeTimer?.status, activeTimer?.label, speak]);

  // Auto-Read Step
  useEffect(() => {
    if (!isListening || !recipe) return;
    const timer = setTimeout(() => speak(recipe.instructions[currentStep]), 300);
    return () => clearTimeout(timer);
  }, [currentStep, isListening, recipe, speak]);

  return {
    state: { recipe, currentStep, showIngredients, showTips, activeCommand, activeTimer, isListening, isSpeaking, transcript, isWakeLockActive },
    actions: { nextStep, prevStep, toggleListening, setShowIngredients, setShowTips, closeView: onClose, speak, startSmartTimer, toggleTimer, stopTimer, parseDurationToSeconds }
  };
}

// Wrapper used in RecipeModal context
export function useMakeController() {
  const { recipe, setIsHandsFree } = useRecipeSessionContext();
  return useCookingSession({ 
    recipe: recipe, 
    onClose: () => setIsHandsFree(false) 
  });
}
