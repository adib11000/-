import React from 'react';

interface InfoSectionProps {
  sessionStartTime: string | null;
  isListening: boolean;
  isPaused: boolean;
  wordCount: number;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ sessionStartTime, isListening, isPaused, wordCount }) => {
  let statusText = "متوقف";
  let statusColor = "text-gray-600";
  let statusIcon = "⏸️";

  if (isListening) {
    if (isPaused) {
      statusText = "وضع الكتابة (مؤقت)";
      statusColor = "text-orange-600";
      statusIcon = "✏️";
    } else {
      statusText = "جاري التسجيل";
      statusColor = "text-red-600";
      statusIcon = "🔴";
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between bg-primary-light p-4 rounded-lg mb-4 border border-blue-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <span className="font-bold text-primary-dark">📅 الجلسة:</span>
        <span className="font-mono text-gray-800" dir="ltr">{sessionStartTime || "--/--/----"}</span>
      </div>
      
      <div className="flex items-center gap-2 mb-2 sm:mb-0">
        <span className="font-bold text-primary-dark">⏱️ الحالة:</span>
        <span className={`font-bold flex items-center gap-1 ${statusColor}`}>
          <span>{statusIcon}</span>
          <span>{statusText}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-bold text-primary-dark">📊 الكلمات:</span>
        <span className="bg-white px-3 py-1 rounded border border-blue-200 font-mono font-bold text-blue-800 min-w-[50px] text-center">
          {wordCount}
        </span>
      </div>
    </div>
  );
};