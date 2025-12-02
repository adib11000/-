import { useState, useEffect, useRef, useCallback } from 'react';
import { MESSAGES } from '../constants';
import { ToastType } from '../types';

interface UseSpeechRecognitionProps {
  addToast: (type: ToastType, message: string) => void;
  updateText: (newText: string) => void;
}

export const useSpeechRecognition = ({ addToast, updateText }: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false); // Ref to track state inside event listeners
  const isPausedRef = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      addToast(ToastType.ERROR, "المتصفح لا يدعم تحويل الصوت لنص. يرجى استخدام Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA';

    recognition.onstart = () => {
      // Intentionally empty, state managed via start/stop methods
    };

    recognition.onresult = (event: any) => {
      // Smart Pause Logic: If paused, ignore the results but keep the mic engine running (or restarting)
      // Note: In a true "Smart Pause" where we want to keep the mic hot but ignore input, 
      // we just filter here.
      if (isPausedRef.current) return;

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        // Appending final transcript to existing text handled by parent or here?
        // To avoid stale state, we pass the chunk to the parent updater
         updateText(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      let msg = MESSAGES.DEFAULT_ERROR;
      if (event.error === 'network') msg = MESSAGES.NETWORK_ERROR;
      if (event.error === 'no-speech') return; // Ignore no-speech to prevent spamming
      if (event.error === 'not-allowed') {
        msg = MESSAGES.NOT_ALLOWED;
        stopListening();
      }
      
      if (event.error !== 'no-speech') {
        addToast(ToastType.ERROR, msg);
      }
    };

    recognition.onend = () => {
      // Infinite Listening Logic
      // If we are supposed to be listening, restart immediately
      if (isListeningRef.current) {
        try {
          recognition.start();
          console.log("Restarting recognition for infinite listening...");
        } catch (e) {
          console.error("Failed to restart recognition", e);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [addToast, updateText]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsListening(true);
    isListeningRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    
    try {
      recognitionRef.current.start();
      addToast(ToastType.INFO, MESSAGES.LISTENING);
    } catch (e) {
      // Sometimes it's already started
      console.log("Recognition already active");
    }
  }, [addToast]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    isListeningRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    recognitionRef.current.stop();
  }, []);

  const togglePause = useCallback(() => {
    if (!isListening) return;
    
    const nextState = !isPaused;
    setIsPaused(nextState);
    isPausedRef.current = nextState;

    if (nextState) {
      addToast(ToastType.INFO, MESSAGES.PAUSE_MODE);
    } else {
      addToast(ToastType.INFO, MESSAGES.RESUME_MODE);
    }
  }, [isListening, isPaused, addToast]);

  return {
    isListening,
    isPaused,
    startListening,
    stopListening,
    togglePause
  };
};