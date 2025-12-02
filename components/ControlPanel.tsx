import React from 'react';
import { Play, Square, Pause, Mic } from 'lucide-react';

interface ControlPanelProps {
  isListening: boolean;
  isPaused: boolean;
  onStart: () => void;
  onStop: () => void;
  onPauseToggle: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isListening, 
  isPaused, 
  onStart, 
  onStop, 
  onPauseToggle 
}) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-6 py-2">
      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={isListening}
        className={`
          flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-xl shadow-lg transition-all transform hover:scale-105
          ${isListening 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-action-green text-white hover:bg-green-700'
          }
        `}
      >
        <Play size={24} fill="currentColor" />
        <span>بدء التسجيل</span>
      </button>

      {/* Pause Button */}
      <button
        onClick={onPauseToggle}
        disabled={!isListening}
        className={`
          flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 min-w-[160px]
          ${!isListening 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : isPaused 
              ? 'bg-action-green text-white ring-2 ring-green-300' // Resume Look
              : 'bg-action-orange text-white hover:bg-orange-600' // Pause Look
          }
        `}
      >
        {isPaused ? <Play size={20} /> : <Pause size={20} />}
        <span>{isPaused ? 'استئناف' : 'إيقاف مؤقت'}</span>
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        disabled={!isListening}
        className={`
          flex items-center justify-center gap-2 px-6 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105
          ${!isListening 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-action-red text-white hover:bg-red-700'
          }
        `}
      >
        <Square size={20} fill="currentColor" />
        <span>إيقاف</span>
      </button>
    </div>
  );
};