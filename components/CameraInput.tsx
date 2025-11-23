
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from './Icons';

interface CameraInputProps {
  onImageCapture: (imageBlob: Blob) => void;
  isProcessing: boolean;
}

const CameraInput: React.FC<CameraInputProps> = ({ onImageCapture, isProcessing }) => {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      setIsActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    if (isActive && streamRef.current) {
      // 1. Main Video (Inside Vertical Frame)
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
      }
      // 2. Background Video (Immersive Fill)
      if (bgVideoRef.current) {
        bgVideoRef.current.srcObject = streamRef.current;
        bgVideoRef.current.play().catch(e => console.log("BG Auto-play prevented:", e));
      }
    }
  }, [isActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Capture full resolution frame from sensor
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            onImageCapture(blob);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (isActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black animate-fadeIn flex items-center justify-center overflow-hidden">
        
        {/* 1. Immersive Background Layer (Blurred & Darkened) */}
        <div className="absolute inset-0 z-0">
             <video 
              ref={bgVideoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover opacity-40 blur-2xl scale-110" 
              style={{ transform: 'scaleX(-1) scale(1.1)' }} 
            />
             <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* 2. Main Camera Interface */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
            
            {/* Close Button - Floating Top Right */}
             <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-black/20 hover:bg-white/10 backdrop-blur-md rounded-full text-white transition-all cursor-pointer hover:scale-110 border border-white/10 z-50"
             >
              <X size={24} />
            </button>

            {/* VERTICAL CAPTURE FRAME */}
            {/* Simulates a phone screen aspect ratio (9:16) */}
            <div className="relative w-full max-w-[400px] aspect-[9/16] max-h-[85vh] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-white/20 bg-black">
                
                 {/* Main Video Feed - Object Cover to fill vertical space */}
                 <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover" 
                  style={{ transform: 'scaleX(-1)' }} 
                />

                 {/* Top Label Overlay */}
                 <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
                     <div className="bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-white/90 text-xs font-bold tracking-widest uppercase">Live Feed</span>
                     </div>
                 </div>

                 {/* Bottom Controls Overlay */}
                 <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end pb-8">
                    <button
                      onClick={captureImage}
                      className="group relative outline-none transition-transform active:scale-95 cursor-pointer"
                      title="Capture Photo"
                    >
                      {/* Outer Glow */}
                      <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl group-hover:bg-emerald-500/50 transition-colors duration-300"></div>
                      {/* Button Border */}
                      <div className="relative w-20 h-20 rounded-full border-[4px] border-white flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-lg group-hover:bg-white/20">
                        {/* Inner Solid Circle */}
                        <div className="w-16 h-16 rounded-full bg-white group-hover:scale-95 transition-transform duration-200 shadow-inner"></div>
                      </div>
                    </button>
                    <p className="text-white/60 text-[10px] mt-3 font-medium tracking-wide uppercase">Tap to Capture</p>
                 </div>
            </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <button
      onClick={startCamera}
      disabled={isProcessing}
      className={`group relative flex flex-col items-center justify-center gap-4 p-8 rounded-[2.5rem] transition-all duration-300 shadow-sm ${
        isProcessing
          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
          : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer'
      }`}
      title="Capture Expression"
    >
       <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
          <Camera size={40} strokeWidth={1.5} />
       </div>
       <span className="font-semibold text-slate-600">Tap to Start Camera</span>
    </button>
  );
};

export default CameraInput;
