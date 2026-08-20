import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Loader2, Volume2, Square, Sparkles, Radio, Target, Coffee, CheckCircle2, Camera } from 'lucide-react';

interface WalkieTalkieProps {
  onSend: (text: string, image?: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  handsFreeMode: boolean;
  onToggleHandsFree: () => void;
  sessionObjective?: string;
  suggestBreak?: boolean;
  onConcludeSession?: () => void;
  onOpenCamera?: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function WalkieTalkie({ 
  onSend, 
  isProcessing, 
  isSpeaking, 
  onStopSpeaking,
  handsFreeMode,
  onToggleHandsFree,
  sessionObjective,
  suggestBreak,
  onConcludeSession,
  onOpenCamera
}: WalkieTalkieProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAutoCameraActive, setIsAutoCameraActive] = useState<boolean>(true);
  const [cameraNotification, setCameraNotification] = useState<string | null>(null);
  const [micBlocked, setMicBlocked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const speechErrorCountRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgStreamRef = useRef<MediaStream | null>(null);

  // Iniciar flujo de cámara en segundo plano para detección instantánea por voz ("Profe mire...")
  useEffect(() => {
    if (!isAutoCameraActive) {
      if (bgStreamRef.current) {
        bgStreamRef.current.getTracks().forEach(t => t.stop());
        bgStreamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    const startBgCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (isMounted) {
          bgStreamRef.current = stream;
          if (bgVideoRef.current) {
            bgVideoRef.current.srcObject = stream;
          }
        } else {
          stream.getTracks().forEach(t => t.stop());
        }
      } catch (err) {
        console.warn("Cámara en segundo plano no disponible:", err);
      }
    };

    startBgCamera();

    return () => {
      isMounted = false;
      if (bgStreamRef.current) {
        bgStreamRef.current.getTracks().forEach(t => t.stop());
        bgStreamRef.current = null;
      }
    };
  }, [isAutoCameraActive]);

  // Capturar foto automáticamente de la cámara en vivo
  const captureBgPhoto = useCallback(() => {
    if (bgVideoRef.current && bgCanvasRef.current) {
      const video = bgVideoRef.current;
      const canvas = bgCanvasRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', 0.8);
        }
      }
    }
    return undefined;
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-EC';

      recognitionRef.current.onresult = (event: any) => {
        speechErrorCountRef.current = 0;
        setMicBlocked(false);
        setError(null);

        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          const lower = transcript.toLowerCase();
          const isVisionTrigger = /mire|mira|vea|veo|termin|acab|mostr|cuaderno|mesa|dibujo|foto/i.test(lower);
          
          let capturedImage: string | undefined = undefined;
          if (isVisionTrigger && isAutoCameraActive) {
            capturedImage = captureBgPhoto();
            if (capturedImage) {
              setCameraNotification("📸 ¡Profe Juan capturó tu mesa al escuchar 'mire/vea'!");
              setTimeout(() => setCameraNotification(null), 4000);
            }
          }

          onSend(transcript, capturedImage);
        }
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsRecording(false);
        const errType = event.error;

        if (errType === 'not-allowed' || errType === 'service-not-allowed' || errType === 'audio-capture') {
          setMicBlocked(true);
          setError('Micrófono sin permiso en este navegador. Toca el micrófono para activarlo.');
        } else if (errType === 'network' || errType === 'aborted') {
          speechErrorCountRef.current += 1;
          if (speechErrorCountRef.current >= 3) {
            setError('Micrófono pausado. Toca el botón para hablar con el Profe Juan.');
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      setError('El reconocimiento de voz no está activado en este navegador.');
    }
  }, [onSend, captureBgPhoto, isAutoCameraActive]);

  const handleStartRecording = useCallback(() => {
    setError(null);
    setMicBlocked(false);
    speechErrorCountRef.current = 0;

    if (recognitionRef.current && !isRecording && !isSpeaking && !isProcessing) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        if (err.name === 'InvalidStateError') {
          setIsRecording(true);
        }
      }
    }
  }, [isRecording, isSpeaking, isProcessing]);

  const handleStopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  // Si está en Modo Manos Libres y el profesor terminó de hablar y procesar, auto-iniciar escucha tras 1.5 segundos (si el micrófono no está bloqueado)
  useEffect(() => {
    let timeoutId: any = null;
    if (handsFreeMode && !isSpeaking && !isProcessing && !isRecording && !micBlocked && speechErrorCountRef.current < 3) {
      timeoutId = setTimeout(() => {
        handleStartRecording();
      }, 1500);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handsFreeMode, isSpeaking, isProcessing, isRecording, micBlocked, handleStartRecording]);

  if (isSpeaking) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <button
          onClick={onStopSpeaking}
          className="relative group w-48 h-48 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 transition-all hover:scale-105"
        >
          <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-75"></div>
          <Volume2 className="w-24 h-24 text-white group-hover:hidden" />
          <Square className="w-20 h-20 text-white hidden group-hover:block" />
        </button>
        <p className="text-xl font-black text-blue-700 animate-pulse">Profe Juan respondiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-5 w-full max-w-md mx-auto">
      {/* Target/Objetivo de la Sesión Actual */}
      {sessionObjective && (
        <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-start space-x-3 shadow-sm text-left animate-fade-in">
          <div className="p-2 bg-amber-500 rounded-xl text-white shrink-0 mt-0.5">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Objetivo de esta Sesión</p>
            <p className="text-xs font-bold text-slate-800 leading-snug">{sessionObjective}</p>
          </div>
        </div>
      )}

      {/* Alerta de Cierre/Pausa Anti-Estrés si sugerido por la IA */}
      {suggestBreak && (
        <div className="w-full bg-indigo-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center space-x-3">
            <Coffee className="w-6 h-6 text-amber-300 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-indigo-200">¡Tiempo Cumplido de Refuerzo!</p>
              <p className="text-xs font-medium">Es hora de descansar la mente. ¡Objetivo avanzado!</p>
            </div>
          </div>
          {onConcludeSession && (
            <button
              onClick={onConcludeSession}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-xl transition-all shrink-0 ml-2 shadow"
            >
              Concluir
            </button>
          )}
        </div>
      )}

      {/* Notificación de Captura Automática por Voz */}
      {cameraNotification && (
        <div className="w-full bg-emerald-600 text-white rounded-2xl p-3 flex items-center justify-center space-x-2 shadow-lg animate-bounce text-xs font-bold">
          <span>{cameraNotification}</span>
        </div>
      )}

      {/* Elementos de Video/Canvas en segundo plano para captura instantánea por voz ("Profe mire...") */}
      <div className="hidden">
        <video ref={bgVideoRef} autoPlay playsInline muted />
        <canvas ref={bgCanvasRef} />
      </div>

      {error && <div className="text-red-500 bg-red-50 px-4 py-2 rounded-xl text-xs font-medium">{error}</div>}
      
      {/* Botón Principal Walkie Talkie */}
      <div className="relative flex items-center justify-center">
        {handsFreeMode && (
          <div className="absolute -top-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center space-x-1 z-10 animate-bounce">
            <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
            <span>Manos Libres Activo</span>
          </div>
        )}

        <button
          onClick={() => {
            if (isRecording) {
              handleStopRecording();
            } else {
              handleStartRecording();
            }
          }}
          disabled={isProcessing}
          onMouseDown={handleStartRecording}
          onMouseUp={handleStopRecording}
          onTouchStart={handleStartRecording}
          onTouchEnd={handleStopRecording}
          className={`relative w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 
            ${isProcessing 
              ? 'bg-amber-500 scale-100 shadow-amber-500/40' 
              : isRecording 
                ? 'bg-rose-500 scale-105 shadow-rose-500/50' 
                : handsFreeMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-indigo-500/40' 
                  : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105 shadow-emerald-500/40'
            }`}
        >
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></div>
          )}
          {isProcessing ? (
            <Loader2 className="w-24 h-24 text-white animate-spin" />
          ) : (
            <Mic className="w-24 h-24 text-white" />
          )}
        </button>
      </div>
      
      <p className="text-xl font-black text-slate-800 text-center">
        {isProcessing
          ? 'Profe Juan está pensando...'
          : isRecording 
            ? '¡Te escucho! Habla ahora...' 
            : handsFreeMode 
              ? 'Escuchando automáticamente...' 
              : 'Presiona para hablar con Profe Juan'}
      </p>

      <div className="flex items-center space-x-2 pt-1 flex-wrap justify-center gap-y-2">
        {/* Botón para abrir la cámara y mostrar al Profe Juan */}
        {onOpenCamera && (
          <button
            onClick={onOpenCamera}
            className="px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all"
            title="Abrir la cámara para mostrarle tus objetos o cuaderno al Profe Juan"
          >
            <Camera className="w-4 h-4 text-amber-300" />
            <span>Mostrar Cámara 📸</span>
          </button>
        )}

        {/* Botón para alternar Cámara Atenta por Voz ("Profe mire...") */}
        <button
          onClick={() => setIsAutoCameraActive(!isAutoCameraActive)}
          className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
            isAutoCameraActive 
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
          }`}
          title="Permite que la cámara tome fotos automáticamente cuando dices 'Profe mire' o 'vea ya terminé'"
        >
          <Camera className={`w-4 h-4 ${isAutoCameraActive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
          <span>{isAutoCameraActive ? 'Cámara Atenta ("Profe mire")' : 'Activar Cámara Atenta'}</span>
        </button>

        {/* Botón para alternar Modo Manos Libres (Escucha automática sin tocar pantalla) */}
        <button
          onClick={onToggleHandsFree}
          className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
            handsFreeMode 
              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-sm' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${handsFreeMode ? 'text-indigo-600' : 'text-slate-500'}`} />
          <span>{handsFreeMode ? 'Manos Libres' : 'Manos Libres'}</span>
        </button>

        {/* Botón para concluir sesión en cualquier momento (Cero estrés) */}
        {onConcludeSession && (
          <button
            onClick={onConcludeSession}
            className="px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-2 transition-all"
            title="Concluir la sesión actual de forma positiva y sin estrés"
          >
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>Pausa Anti-Estrés</span>
          </button>
        )}
      </div>
    </div>
  );
}
