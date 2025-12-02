import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Maximize2, Minimize2, Mic } from 'lucide-react';

import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { ControlPanel } from './components/ControlPanel';
import { InfoSection } from './components/InfoSection';
import { ActionBar } from './components/ActionBar';
import { Toast } from './components/Toast';
import { MESSAGES, LOCAL_STORAGE_KEYS } from './constants';
import { ToastMessage, ToastType } from './types';

function App() {
  // State
  const [text, setText] = useState<string>('');
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Helper: Toast Manager
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper: Text Updater (Appends text efficiently)
  // We use a functional update and ensure a space is added if needed.
  const updateTextFromSpeech = useCallback((newChunk: string) => {
    setText(prev => {
      const trimmedChunk = newChunk.trim();
      if (!trimmedChunk) return prev;
      return prev ? `${prev} ${trimmedChunk}` : trimmedChunk;
    });
  }, []);

  // Hook: Speech Logic
  const { 
    isListening, 
    isPaused, 
    startListening, 
    stopListening, 
    togglePause 
  } = useSpeechRecognition({ 
    addToast, 
    updateText: updateTextFromSpeech 
  });

  // --- Persistence & Initialization ---

  useEffect(() => {
    // Load from LocalStorage on Mount
    const savedText = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_TEXT);
    if (savedText) setText(savedText);

    const savedFullscreen = localStorage.getItem(LOCAL_STORAGE_KEYS.FULLSCREEN);
    if (savedFullscreen === 'true') toggleFullscreen(true);
  }, []);

  useEffect(() => {
    // Auto-save text to LocalStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_TEXT, text);
  }, [text]);

  // --- Handlers ---

  const handleStart = () => {
    if (!sessionStartTime) {
        setSessionStartTime(new Date().toLocaleString('ar-SA'));
    }
    // Note: We do NOT clear text here to support the "Eternal" requirement.
    // If the user wants to clear, they must use "New Session".
    // But per spec button description "Reset previous texts", we might need to be careful.
    // The prompt says "I want it not to delete all info...". 
    // So we treat "Start" as "Activate Mic".
    
    startListening();
  };

  const handleStop = () => {
    stopListening();
    // Save session logic could go here (pushing to history array)
    addToast(ToastType.SUCCESS, MESSAGES.SAVE_SUCCESS);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancelling edit
      setIsEditing(false);
      addToast(ToastType.INFO, MESSAGES.CANCEL_EDIT);
    } else {
      // Entering edit
      setIsEditing(true);
      // Pause if listening
      if (isListening && !isPaused) {
        togglePause();
      }
      addToast(ToastType.INFO, MESSAGES.EDIT_MODE);
    }
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    addToast(ToastType.SUCCESS, MESSAGES.SAVE_SUCCESS);
  };

  const handleCopy = () => {
    if (!text) {
      addToast(ToastType.WARNING, MESSAGES.NO_TEXT_COPY);
      return;
    }
    navigator.clipboard.writeText(text);
    if (textAreaRef.current) textAreaRef.current.select();
    addToast(ToastType.SUCCESS, MESSAGES.COPY_SUCCESS);
  };

  const handleExport = () => {
    if (!text) {
      addToast(ToastType.WARNING, MESSAGES.NO_TEXT_COPY);
      return;
    }
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `speech_${dateStr}.txt`;
    
    const content = `تطبيق تحويل الصوت إلى نص
=====================================
تاريخ ووقت الجلسة: ${sessionStartTime || new Date().toLocaleString('ar-SA')}
عدد الكلمات: ${text.trim().split(/\s+/).filter(w => w.length > 0).length}
عدد الأحرف: ${text.length}
=====================================

${text}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    addToast(ToastType.SUCCESS, MESSAGES.EXPORT_SUCCESS.replace('[اسم الملف]', filename));
  };

  const handleNewSession = () => {
    if (text) {
      if (window.confirm(MESSAGES.NEW_SESSION_CONFIRM)) {
        // Save previous session to history (optional implementation)
        setText('');
        setSessionStartTime(null);
        if (isListening) stopListening();
        addToast(ToastType.SUCCESS, "تم بدء جلسة جديدة");
      }
    } else {
      setSessionStartTime(null);
      addToast(ToastType.INFO, "جلسة جديدة جاهزة");
    }
  };

  const toggleFullscreen = (forceState?: boolean) => {
    const newState = forceState !== undefined ? forceState : !isFullscreen;
    setIsFullscreen(newState);
    localStorage.setItem(LOCAL_STORAGE_KEYS.FULLSCREEN, String(newState));
  };

  // Counters
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;

  return (
    <div className={`flex flex-col bg-white shadow-2xl overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-screen md:w-[90%] md:mx-auto md:my-6 md:rounded-2xl'}`}>
      
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-dark to-primary-main text-white p-4 shadow-md flex items-center justify-between h-[70px]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleFullscreen()}
            className="p-2 bg-white/20 rounded hover:bg-white/30 transition text-white"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
          <div className="mr-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Mic size={24} />
              تطبيق تحويل الصوت إلى نص
            </h1>
            <p className="text-xs text-blue-100 hidden sm:block">استخدم الميكروفون لتحويل صوتك إلى نص عربي بسهولة</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-6 bg-[#f5f5f5] overflow-y-auto">
        
        <ControlPanel 
          isListening={isListening}
          isPaused={isPaused}
          onStart={handleStart}
          onStop={handleStop}
          onPauseToggle={togglePause}
        />

        <InfoSection 
          sessionStartTime={sessionStartTime}
          isListening={isListening}
          isPaused={isPaused}
          wordCount={wordCount}
        />

        {/* Text Area Container */}
        <div className={`relative flex-1 flex flex-col ${isFullscreen ? 'h-full' : 'min-h-[300px]'}`}>
          <textarea
            ref={textAreaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!isEditing && (!isPaused || !isListening)} // Editable if manually editing OR if paused during listening (Smart Pause allows edit)
            placeholder="سيظهر النص المحول هنا..."
            className={`
              w-full h-full p-6 text-lg rounded-lg border-2 resize-none transition-all focus:outline-none shadow-inner
              ${(isEditing || (isPaused && isListening)) 
                ? 'bg-white border-primary-main shadow-blue-200/50' 
                : 'bg-gray-50 border-gray-200 cursor-text'
              }
              ${isFullscreen ? 'text-xl leading-loose' : 'text-lg leading-relaxed'}
            `}
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          />
          <div className="absolute bottom-4 left-4 text-gray-500 bg-white/80 px-2 py-1 rounded text-sm font-bold border border-gray-200">
            عدد الأحرف: {charCount}
          </div>
        </div>

        <ActionBar 
          isEditing={isEditing}
          hasText={text.length > 0}
          onToggleEdit={handleToggleEdit}
          onCopy={handleCopy}
          onExport={handleExport}
          onNewSession={handleNewSession}
          onSave={handleSaveEdit}
        />

      </main>

      {/* Toasts Overlay */}
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}

    </div>
  );
}

export default App;