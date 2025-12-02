export interface SessionData {
  id: string;
  timestamp: string;
  text: string;
  wordCount: number;
  charCount: number;
}

export enum ToastType {
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}