import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WalkieTalkie } from './components/WalkieTalkie';
import { Message, TutorResponse } from './types';
import { BookOpen, GraduationCap, LayoutDashboard, Target } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastResponse, setLastResponse] = useState<TutorResponse | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    // Attempt to load voices early
    if (synthRef.current) {
      synthRef.current.getVoices();
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Stop any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-EC'; // Ecuadorian Spanish if available, fallback to es
    utterance.rate = 0.95; // Slightly slower for children
    utterance.pitch = 1.1; // Slightly higher pitch to sound friendly

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: newMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data: TutorResponse = await response.json();
      
      setLastResponse(data);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.speech_text,
        metadata: {
          dcd_evaluated: data.dcd_evaluated,
          achievement_level: data.achievement_level,
          next_action: data.next_action,
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText(data.speech_text);

    } catch (error) {
      console.error("Error calling tutor API:", error);
      // Fallback behavior on error
      setIsProcessing(false);
      alert("Hubo un problema de conexión con el Profe Juan.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* LEFT PANEL: Student View (Walkie Talkie) */}
      <div className="flex-1 flex flex-col relative items-center justify-center p-6 bg-gradient-to-b from-sky-50 to-white">
        <div className="absolute top-8 left-8 flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Profe Juan</h1>
            <p className="text-sm font-medium text-slate-500">Aulas Activas ÉPICO</p>
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col items-center mt-12">
          {lastResponse && (
            <div className="mb-12 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 max-w-sm text-center">
               <p className="text-lg text-slate-700 font-medium leading-relaxed">
                 "{lastResponse.speech_text}"
               </p>
            </div>
          )}

          <WalkieTalkie 
            onSend={handleSend}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
          />
        </div>
      </div>

      {/* RIGHT PANEL: Teacher/Debug View */}
      <div className="w-full md:w-[400px] lg:w-[500px] bg-slate-100 border-l border-slate-200 p-6 flex flex-col h-screen overflow-y-auto">
        <div className="flex items-center space-x-2 mb-6 text-slate-700">
          <LayoutDashboard className="w-5 h-5" />
          <h2 className="text-lg font-bold">Monitor del Docente</h2>
        </div>

        {/* Metadata Status Card */}
        {lastResponse ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
            <div className="flex items-center space-x-2 mb-4 text-indigo-600">
              <Target className="w-5 h-5" />
              <h3 className="font-semibold">Evaluación Actual</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">DCD Evaluada</p>
                <div className="inline-block bg-indigo-50 text-indigo-700 font-mono px-2 py-1 rounded text-sm font-medium">
                  {lastResponse.dcd_evaluated}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nivel</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${lastResponse.achievement_level === 'A' ? 'bg-green-100 text-green-800' : 
                      lastResponse.achievement_level === 'EP' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {lastResponse.achievement_level === 'A' ? 'Adquirido' : 
                     lastResponse.achievement_level === 'EP' ? 'En Proceso' : 'Inicio'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Próxima Acción</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {lastResponse.next_action}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center mb-6">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Esperando interacción del estudiante...</p>
          </div>
        )}

        {/* Conversation Log */}
        <div className="flex-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Registro de Sesión</h3>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
                  {msg.role === 'user' ? 'Estudiante' : 'Profe Juan'}
                </span>
                <div 
                  className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-slate-400 text-center mt-8">No hay mensajes en el registro.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

