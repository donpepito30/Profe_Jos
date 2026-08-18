import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Loader2, Volume2, Square } from 'lucide-react';

interface WalkieTalkieProps {
  onSend: (text: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

// Ensure SpeechRecognition is available for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function WalkieTalkie({ onSend, isProcessing, isSpeaking, onStopSpeaking }: WalkieTalkieProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-EC';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSend(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError(`Error de micrófono: ${event.error}`);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      setError('El reconocimiento de voz no es compatible con este navegador.');
    }
  }, [onSend]);

  const handleStartRecording = useCallback(() => {
    setError(null);
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        if (err.name === 'InvalidStateError') {
          // Already started, safely ignore
          setIsRecording(true);
        } else {
          console.error("Could not start recognition", err);
        }
      }
    }
  }, [isRecording]);

  const handleStopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  if (isSpeaking) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <button
          onClick={onStopSpeaking}
          className="relative group w-48 h-48 rounded-full bg-blue-100 flex items-center justify-center shadow-lg transition-all"
        >
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse"></div>
          <Volume2 className="w-20 h-20 text-blue-600 group-hover:hidden" />
          <Square className="w-20 h-20 text-blue-600 hidden group-hover:block" />
        </button>
        <p className="text-xl font-medium text-blue-700 animate-pulse">Profe Juan está hablando...</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-48 h-48 rounded-full bg-orange-100 flex items-center justify-center shadow-lg">
          <Loader2 className="w-20 h-20 text-orange-500 animate-spin" />
        </div>
        <p className="text-xl font-medium text-orange-700">Profe Juan está pensando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {error && <div className="text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-medium">{error}</div>}
      
      <button
        onMouseDown={handleStartRecording}
        onMouseUp={handleStopRecording}
        onMouseLeave={handleStopRecording}
        onTouchStart={handleStartRecording}
        onTouchEnd={handleStopRecording}
        className={`relative w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 
          ${isRecording 
            ? 'bg-red-500 scale-95 shadow-red-500/50' 
            : 'bg-green-500 hover:bg-green-600 hover:scale-105 shadow-green-500/30'
          }`}
      >
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
        )}
        <Mic className={`w-24 h-24 ${isRecording ? 'text-white' : 'text-white'}`} />
      </button>
      
      <p className="text-2xl font-bold text-slate-700 text-center">
        {isRecording ? '¡Te escucho! Suelta para enviar' : 'Mantén presionado para hablar'}
      </p>
    </div>
  );
}
