import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Send, Image as ImageIcon, CheckCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (comment: string, base64Image: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [comment, setComment] = useState<string>('Mira Profe Juan lo que tengo en mi mesa');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Iniciar la cámara cuando el modal se abre
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("No se pudo acceder a la cámara:", err);
      setError("No pudimos abrir la cámara directamente. Puedes subir una foto desde tus archivos o galería.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (capturedImage) {
      onCapture(comment.trim() || 'Mira lo que tengo en mi mesa Profe Juan', capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-sm tracking-wide">¡Muéstrale tu Mesa al Profe Juan! 📸</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-all text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-4 flex-1 flex flex-col items-center justify-center space-y-4 overflow-y-auto">
          
          {capturedImage ? (
            /* Vista previa de foto capturada */
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md">
                <img 
                  src={capturedImage} 
                  alt="Vista previa de lo que le muestras al Profe" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center space-x-1 shadow">
                  <CheckCircle className="w-3 h-3" />
                  <span>Foto Lista</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCapturedImage(null);
                  startCamera();
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tomar otra foto</span>
              </button>
            </div>
          ) : (
            /* Transmisión de Cámara en Vivo */
            <div className="w-full flex flex-col items-center space-y-3">
              {error ? (
                <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs text-center space-y-2">
                  <p className="font-medium">{error}</p>
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  <button
                    onClick={toggleCameraFacing}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all"
                    title="Cambiar Cámara"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Controles de Disparo o Carga de Archivo */}
              <div className="flex items-center justify-center space-x-4 w-full">
                {!error && (
                  <button
                    onClick={takePhoto}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition-all transform active:scale-95"
                  >
                    <Camera className="w-5 h-5" />
                    <span>¡Tomar Foto de mi Mesa! 📸</span>
                  </button>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 flex items-center space-x-1.5 transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span>Subir Foto</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          )}

          {/* Campo de Comentario / Voz */}
          <div className="w-full pt-2">
            <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
              ¿Qué le quieres decir al Profe Juan sobre tu foto?
            </label>
            <input 
              type="text" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej. Mira Profe Juan, conté 5 frejoles en mi cuaderno..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Pie de página con Enviar */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-100 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!capturedImage}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Foto al Profe Juan</span>
          </button>
        </div>

      </div>
    </div>
  );
}
