
import { useState, useEffect, useCallback, useRef } from 'react';

export type VoiceCommand = 
  | 'NEXT_STEP' 
  | 'PREV_STEP' 
  | 'READ_CURRENT' 
  | 'READ_INGREDIENTS' 
  | 'STOP_TTS' 
  | 'START_TIMER'
  | 'STOP_TIMER'
  | 'PAUSE_TIMER'
  | 'RESUME_TIMER'
  | 'UNKNOWN';

interface UseVoiceControlProps {
  onCommand: (command: VoiceCommand, text: string) => void;
}

export function useVoiceControl({ onCommand }: UseVoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);
  const isExplicitlyStopped = useRef(true); // Default to true so it doesn't auto-start on mount
  const callbackRef = useRef(onCommand);

  // Keep callback fresh without restarting effect
  useEffect(() => {
    callbackRef.current = onCommand;
  }, [onCommand]);

  // Load voices (Chrome loads them asynchronously)
  useEffect(() => {
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    
    // Chrome requires this event listener
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  useEffect(() => {
    // Browser compatibility check
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // We still listen for commands in English

    recognition.onresult = (event: any) => {
      const resultsLength = event.results.length;
      const lastResult = event.results[resultsLength - 1];
      
      if (lastResult.isFinal) {
        const text = lastResult[0].transcript.trim().toLowerCase();
        setTranscript(text);
        processText(text);
      }
    };

    // Sync React state with actual engine status
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      // Auto-restart unless user manually stopped it
      if (!isExplicitlyStopped.current) {
        try {
           recognition.start();
        } catch (e) {
           // Ignore errors if it fails to restart (e.g. lost permission or transient issue)
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setIsListening(false);
        isExplicitlyStopped.current = true;
      }
      // Ignore 'no-speech' errors which happen frequently in silence
    };

    recognitionRef.current = recognition;

    return () => {
      isExplicitlyStopped.current = true; // Prevent restart on unmount
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const processText = (text: string) => {
    let command: VoiceCommand = 'UNKNOWN';
    const t = text.toLowerCase();

    // 1. Ingredients (Highest Priority)
    // Matches: "read ingredients", "what ingredients do I need", "show shopping list"
    if (/(ingredient|grocery|shopping|list|need)/.test(t)) {
      command = 'READ_INGREDIENTS';
    }
    // 2. Timer Controls
    else if (/(start|begin|set)\s+timer/.test(t)) {
      command = 'START_TIMER';
    }
    else if (/(stop|cancel|dismiss|end)\s+timer/.test(t)) {
      command = 'STOP_TIMER';
    }
    else if (/(pause|hold)\s+timer/.test(t)) {
      command = 'PAUSE_TIMER';
    }
    else if (/(resume|restart|continue)\s+timer/.test(t)) {
      command = 'RESUME_TIMER';
    }
    // 3. Stop/Silence
    // Matches: "stop", "quiet", "be quiet", "shut up", "hush"
    else if (/(stop|quiet|hush|silence|off|shut)/.test(t)) {
      command = 'STOP_TTS';
    }
    // 4. Navigation - Previous
    // Matches: "go back", "previous step", "return", "back"
    else if (/(back|previous|return|last|behind)/.test(t)) {
      command = 'PREV_STEP';
    }
    // 5. Navigation - Next
    // Matches: "next step", "continue", "go on", "done", "finished", "ok", "check"
    // Note: Checked before READ_CURRENT to handle "read next step" as a move action.
    else if (/(next|forward|continue|go|done|finish|okay|ok|check|skip)/.test(t)) {
      command = 'NEXT_STEP';
    }
    // 6. Read/Repeat (General Query)
    // Matches: "read step", "what is the step", "repeat that", "say again", "current step", "tell me"
    else if (/(read|speak|tell|what|repeat|again|current|where)/.test(t)) {
      command = 'READ_CURRENT';
    }

    callbackRef.current(command, text);
  };

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      isExplicitlyStopped.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      isExplicitlyStopped.current = false;
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        console.warn("Speech Recognition start error:", e.message);
        if (e.message && e.message.includes('already started')) {
          setIsListening(true);
        }
      }
    }
  }, [isListening]);

  const cancel = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Detect language: simple regex for Chinese characters
      const isChinese = /[\u4e00-\u9fa5]/.test(text);

      if (isChinese) {
        utterance.lang = 'zh-HK'; // Specific locale code for Cantonese
        
        // Try to find a specific Cantonese voice object from the loaded voices
        // Priority: zh-HK matches -> specific Cantonese keywords -> fallback
        const cantoneseVoice = availableVoices.find(v => v.lang === 'zh-HK') || 
                               availableVoices.find(v => v.lang.includes('zh') && (v.name.includes('HK') || v.name.includes('Cantonese')));
        
        if (cantoneseVoice) {
          utterance.voice = cantoneseVoice;
        }
      } else {
        utterance.lang = 'en-US';
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, [availableVoices]);

  return { isListening, isSpeaking, transcript, toggleListening, speak, cancel };
}
