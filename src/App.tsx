import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WalkieTalkie } from './components/WalkieTalkie';
import { Message, TutorResponse } from './types';
import { ECUADOR_CURRICULUM, DCDItem } from './data/ecuadorCurriculum';
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  Target, 
  Wifi, 
  WifiOff, 
  Search, 
  Sparkles, 
  Layers, 
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ListFilter
} from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastResponse, setLastResponse] = useState<TutorResponse | null>(null);
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'curriculum'>('monitor');
  const [selectedSubject, setSelectedSubject] = useState<string>('TODOS');
  const [selectedSublevel, setSelectedSublevel] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const pingIntervalRef = useRef<any>(null);

  // Cargar historial de la Base de Datos D1
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/metrics');
      if (res.ok) {
        const data: any = await res.json();
        if (data.results) {
          setDbHistory(data.results);
        }
      }
    } catch (err) {
      console.error("Error al obtener historial de D1:", err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, lastResponse]);

  // Inicializar síntesis de voz del navegador
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    if (synthRef.current) {
      synthRef.current.getVoices();
    }
  }, []);

  // Inicializar y mantener la conexión WebSocket con Cloudflare Realtime Kit
  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/session/connect`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("🟢 Conectado a Cloudflare Realtime WebSocket");
        setWsConnected(true);

        // Heartbeat para mantener viva la conexión en Cloudflare
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'tutor_response') {
            const responseData: TutorResponse = data.data;
            setLastResponse(responseData);
            
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: responseData.speech_text,
              metadata: {
                dcd_evaluated: responseData.dcd_evaluated,
                dcd_title: responseData.dcd_title,
                subject: responseData.subject,
                sublevel: responseData.sublevel,
                achievement_level: responseData.achievement_level,
                next_action: responseData.next_action,
              }
            };

            setMessages(prev => [...prev, assistantMessage]);
            speakText(responseData.speech_text);
            setIsProcessing(false);
          } else if (data.error) {
            console.error("Error del Worker:", data.error);
            alert("Profe Juan dice: " + data.error);
            setIsProcessing(false);
          }
        } catch (e) {
          console.error("Error leyendo mensaje de WebSocket:", e);
          setIsProcessing(false);
        }
      };

      ws.onerror = () => {
        console.warn("Estado del WebSocket: Conexión interrumpida o no disponible, usando fallback HTTP.");
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        // Reconexión automática
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const speakText = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel(); // Detener cualquier audio previo

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-EC'; // Español ecuatoriano
    utterance.rate = 0.95;    // Cadencia amigable para niños
    utterance.pitch = 1.1;     // Tono cálido

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

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

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'audio_transcript',
        text: text
      }));
    } else {
      // Fallback transparente a HTTP POST cuando WebSocket no está disponible o se bloqueó en el navegador
      try {
        const res = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history: messages.map(m => ({ role: m.role, content: m.content })) })
        });
        
        if (res.ok) {
          const responseData: TutorResponse = await res.json();
          setLastResponse(responseData);
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseData.speech_text,
            metadata: {
              dcd_evaluated: responseData.dcd_evaluated,
              dcd_title: responseData.dcd_title,
              subject: responseData.subject,
              sublevel: responseData.sublevel,
              achievement_level: responseData.achievement_level,
              next_action: responseData.next_action,
            }
          };

          setMessages(prev => [...prev, assistantMessage]);
          speakText(responseData.speech_text);
        } else {
          const errData: any = await res.json().catch(() => ({}));
          alert("Profe Juan dice: " + (errData.error || "Error de conexión HTTP"));
        }
      } catch (httpErr: any) {
        console.error("Error de conexión HTTP fallback:", httpErr);
        alert("Hubo un problema de conexión con el Profe Juan.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Filtrado de la Malla Curricular
  const filteredCurriculum = ECUADOR_CURRICULUM.filter(item => {
    const matchesSubject = selectedSubject === 'TODOS' || item.subject === selectedSubject;
    const matchesSublevel = selectedSublevel === 'TODOS' || item.sublevel === selectedSublevel;
    const matchesSearch = item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSublevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* PANEL IZQUIERDO: Vista del Estudiante (Walkie-Talkie Socrático) */}
      <div className="flex-1 flex flex-col relative items-center justify-center p-6 bg-gradient-to-b from-sky-50 via-white to-blue-50/30">
        
        {/* Cabecera del Estudiante */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Profe Juan</h1>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Aulas Activas ÉPICO Ecuador</p>
            </div>
          </div>

          {/* Indicador de Estado Cloudflare Realtime */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            wsConnected 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
          }`}>
            {wsConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
            <span>{wsConnected ? 'Cloudflare Realtime' : 'Reconectando...'}</span>
          </div>
        </div>

        {/* ÁREA CENTRAL DEL WALKIE TALKIE */}
        <div className="w-full max-w-md flex flex-col items-center mt-16">
          {lastResponse && (
            <div className="mb-8 bg-white px-6 py-5 rounded-3xl shadow-sm border border-slate-200/80 max-w-sm text-center relative animate-fade-in">
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 border-r border-b border-slate-200/80"></div>
              <p className="text-lg text-slate-800 font-semibold leading-relaxed">
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

          <div className="mt-8 text-center bg-blue-50/80 border border-blue-100 rounded-2xl p-4 max-w-xs">
            <p className="text-xs font-medium text-blue-800 flex items-center justify-center space-x-1">
              <Sparkles className="w-4 h-4 text-blue-600 mr-1" />
              <span>Aprende usando <b>frejoles, tapitas, cubiertos y empaques</b> de tu casa.</span>
            </p>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO: Monitor del Docente / Malla Curricular EGB */}
      <div className="w-full md:w-[420px] lg:w-[480px] bg-slate-100/90 border-l border-slate-200/80 p-6 flex flex-col h-screen overflow-y-auto">
        
        {/* Selector de Pestañas Docentes */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'monitor' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Monitor en Vivo</span>
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'curriculum' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Malla DCD Ecuador</span>
          </button>
        </div>

        {/* CONTENIDO PESTAÑA 1: MONITOR EN VIVO */}
        {activeTab === 'monitor' && (
          <div className="flex-1 flex flex-col space-y-6">
            
            {/* Tarjeta de Evaluación Actual de Gemini */}
            {lastResponse ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold text-sm">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <span>Evaluación Actual DCD</span>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full uppercase">
                    {lastResponse.subject || 'Matemáticas'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Código & Destreza</p>
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-600 text-white font-mono px-2 py-0.5 rounded text-xs font-bold">
                        {lastResponse.dcd_evaluated}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {lastResponse.dcd_title || 'Destreza EGB Evaluada'}
                      </span>
                    </div>
                  </div>

                  {lastResponse.sublevel && (
                    <div>
                      <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Subnivel EGB</p>
                      <p className="text-xs font-semibold text-slate-600">{lastResponse.sublevel}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nivel de Logro</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold
                        ${lastResponse.achievement_level === 'A' ? 'bg-emerald-100 text-emerald-800' : 
                          lastResponse.achievement_level === 'EP' ? 'bg-amber-100 text-amber-800' : 
                          'bg-rose-100 text-rose-800'}`}>
                        {lastResponse.achievement_level === 'A' ? 'Adquirido (A)' : 
                         lastResponse.achievement_level === 'EP' ? 'En Proceso (EP)' : 'Inicio (I)'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Siguiente Acción</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800">
                        {lastResponse.next_action === 'CONTINUE' ? 'Continuar' :
                         lastResponse.next_action === 'REINFORCE' ? 'Reforzar DCD' : 'Siguiente DCD'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center">
                <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-bold">Esperando interacción del estudiante...</p>
                <p className="text-xs text-slate-400 mt-1">Sostén el botón verde y habla con Profe Juan.</p>
              </div>
            )}

            {/* Historial desde la Base de Datos D1 */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Historial D1 Database</h3>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  {dbHistory.length} registros
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                {dbHistory.map((evalRecord, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm flex flex-col space-y-2 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-indigo-50 text-indigo-700 font-mono px-2 py-0.5 rounded text-[11px] font-bold mr-2">
                          {evalRecord.dcd_evaluated}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {evalRecord.dcd_title || 'Evaluación DCD'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        evalRecord.achievement_level === 'A' ? 'bg-emerald-100 text-emerald-800' : 
                        evalRecord.achievement_level === 'EP' ? 'bg-amber-100 text-amber-800' : 
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {evalRecord.achievement_level}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{evalRecord.subject || 'EGB Ecuador'} • {evalRecord.sublevel || 'Elemental'}</span>
                      <span className="font-mono">{new Date(evalRecord.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}

                {dbHistory.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
                    <p className="text-xs font-medium">No hay registros guardados en la base de datos D1 aún.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: MALLA CURRICULAR DCD ECUADOR */}
        {activeTab === 'curriculum' && (
          <div className="flex-1 flex flex-col space-y-4">
            
            {/* Filtros de Malla */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por código (ej. M.2.1.25) o tema..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Asignatura</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  >
                    <option value="TODOS">Todas</option>
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Lengua y Literatura">Lengua y Literatura</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Subnivel EGB</label>
                  <select
                    value={selectedSublevel}
                    onChange={(e) => setSelectedSublevel(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="Preparatoria (1° EGB)">Preparatoria (1° EGB)</option>
                    <option value="Elemental (2°-4° EGB)">Elemental (2°-4° EGB)</option>
                    <option value="Media (5°-7° EGB)">Media (5°-7° EGB)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Destrezas DCD */}
            <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
              {filteredCurriculum.map((item: DCDItem) => (
                <div key={item.code} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="bg-blue-600 text-white font-mono px-2.5 py-0.5 rounded-lg text-xs font-bold">
                      {item.code}
                    </span>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">
                      {item.subject}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[10px] text-amber-700 uppercase">Actividad con Objetos Cotidianos:</span>
                      <span>{item.concreteActivityExample}</span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCurriculum.length === 0 && (
                <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-400">
                  <p className="text-xs font-medium">No se encontraron destrezas con esos filtros.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
