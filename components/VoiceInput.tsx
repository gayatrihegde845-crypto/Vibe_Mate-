
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from './Icons';

interface VoiceInputProps {
  onAudioCapture: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onAudioCapture, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Silence Detection Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpeakingTimeRef = useRef<number>(0);
  const speechDetectedRef = useRef<boolean>(false);

  const cleanupAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 1. Setup Media Recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioCapture(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Clean up & Reset UI
        cleanupAudioAnalysis();
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start visual timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // 2. Setup Silence Detection
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Initialize detection state
      lastSpeakingTimeRef.current = Date.now();
      speechDetectedRef.current = false;
      
      const checkForSilence = () => {
        // Safety check if analysis was cleaned up
        if (!analyserRef.current) return;
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

        const bufferLength = analyser.frequencyBinCount; 
        const dataArray = new Float32Array(bufferLength);
        analyser.getFloatTimeDomainData(dataArray);

        // Calculate RMS (Volume)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Threshold for "speech".
        const THRESHOLD = 0.015; 
        
        if (rms > THRESHOLD) {
          lastSpeakingTimeRef.current = Date.now();
          speechDetectedRef.current = true;
        } else {
          const silenceDuration = Date.now() - lastSpeakingTimeRef.current;
          
          // REVERTED: Increased timeout back to 1500ms for more comfortable speaking time
          const timeoutLimit = speechDetectedRef.current ? 1500 : 5000;

          if (silenceDuration > timeoutLimit) {
             stopRecording(); // Auto-stop
             return; 
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkForSilence);
      };

      // Start monitoring loop
      checkForSilence();

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupAudioAnalysis();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 gap-6 animate-[fadeIn_0.5s]">
         <div className="relative p-6 bg-slate-100 rounded-full animate-pulse">
             <Loader2 size={40} className="text-slate-400 animate-spin" />
         </div>
         <p className="text-slate-500 font-medium">Listening...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-6 gap-8 animate-[fadeIn_0.5s]">
      
      {/* Visualization Area */}
      <div className="relative flex items-center justify-center w-48 h-48">
        {isRecording && (
          <>
            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-[ping_2s_infinite]"></div>
            <div className="absolute inset-4 bg-rose-500/10 rounded-full animate-[ping_2s_infinite_0.5s]"></div>
            <div className="absolute -inset-4 border border-rose-200 rounded-full opacity-50 animate-[spin_10s_linear_infinite]"></div>
          </>
        )}
        
        {!isRecording && (
           <div className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-full animate-[spin_20s_linear_infinite]"></div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative z-10 flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl ${
            isRecording 
              ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white scale-110 shadow-rose-500/40' 
              : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:scale-105 shadow-indigo-500/40'
          }`}
        >
           {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={32} />}
        </button>
      </div>

      {/* Status Text & Timer */}
      <div className="text-center space-y-2">
        {isRecording ? (
           <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-1 bg-rose-50 border border-rose-100 rounded-full">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                 <span className="text-rose-500 font-mono font-bold">{formatTime(recordingTime)}</span>
              </div>
              <p className="text-slate-500 text-sm">Listening... (Auto-stop on silence)</p>
           </div>
        ) : (
          <div className="space-y-1">
             <h3 className="text-xl font-bold text-slate-700">Voice Assistant</h3>
             <p className="text-slate-400 text-sm">Speaks 🇬🇧 English, 🇮🇳 Hindi & Kannada</p>
          </div>
        )}
      </div>

      {/* Decorative Waveform Simulation */}
      {isRecording && (
        <div className="flex items-center gap-1 h-8">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 bg-rose-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]"
              style={{ 
                height: `${Math.random() * 100}%`, 
                animationDelay: `${i * 0.1}s` 
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
