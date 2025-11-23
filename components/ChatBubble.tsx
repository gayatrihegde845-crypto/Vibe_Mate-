
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import MoodBadge from './MoodBadge';
import Recommendations from './Recommendations';
import { User, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface ChatBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
}

// Helper to decode raw PCM data (from Gemini TTS)
async function decodeAudioData(
  base64Data: string,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isLatest }) => {
  const isBot = message.role === 'assistant';
  const hasRecommendations = message.analysis && (
    (message.analysis.musicRecommendations && message.analysis.musicRecommendations.length > 0) ||
    (message.analysis.mindfulExercises && message.analysis.mindfulExercises.length > 0) ||
    (message.analysis.postures && message.analysis.postures.length > 0) ||
    message.analysis.creativeActivity
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedAuto, setHasPlayedAuto] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Handle Auto-play for latest message with audio
  useEffect(() => {
    if (isBot && message.audioContent && isLatest && !hasPlayedAuto) {
      playAudio();
      setHasPlayedAuto(true);
    }
    return () => stopAudio();
  }, [isLatest, message.audioContent]);

  const playAudio = async () => {
    if (!message.audioContent) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // Resume context if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const buffer = await decodeAudioData(message.audioContent, audioContextRef.current);
      
      // Stop existing
      if (sourceRef.current) {
        sourceRef.current.stop();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      sourceRef.current = source;
      source.start();
      setIsPlaying(true);

    } catch (e) {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch(e) {}
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) stopAudio();
    else playAudio();
  };

  return (
    <div className={`flex w-full mb-6 ${isBot ? 'justify-start' : 'justify-end'} animate-[slideUp_0.3s_ease-out]`}>
      <div className={`flex max-w-[90%] md:max-w-[85%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm
          ${isBot ? 'bg-gradient-to-tr from-emerald-400 to-teal-400' : 'bg-slate-200'}`}>
          {isBot ? <Sparkles size={16} className="text-white" /> : <User size={16} className="text-slate-500" />}
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-1">
          <div className={`relative px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
            ${isBot 
              ? 'bg-white/80 backdrop-blur-sm text-slate-700 border border-white/50 rounded-tl-none' 
              : 'bg-indigo-500 text-white rounded-tr-none'
            }`}>
            
            {/* User Media Indicators */}
            {!isBot && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.imageUrl && (
                   <div className="relative group rounded-lg overflow-hidden h-20 w-20 border-2 border-white/30 shadow-sm">
                     <img src={message.imageUrl} alt="User uploaded" className="h-full w-full object-cover" />
                   </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
               {/* Text Content */}
               <p className="whitespace-pre-wrap">{message.text || message.analysis?.empatheticResponse}</p>
               
               {/* Audio Player Controls for Bot */}
               {isBot && message.audioContent && (
                 <button 
                   onClick={toggleAudio}
                   className={`self-start mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                     isPlaying 
                       ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' 
                       : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600'
                   }`}
                 >
                   {isPlaying ? (
                     <>
                       <Volume2 size={14} className="animate-pulse" /> 
                       <span>Speaking...</span>
                     </>
                   ) : (
                     <>
                       <Volume2 size={14} />
                       <span>Play Voice</span>
                     </>
                   )}
                 </button>
               )}
            </div>
          </div>

          {/* Assistant Extras (Mood Badge, Recommendations) */}
          {isBot && message.analysis && (
            <div className="mt-1 space-y-3">
              {/* Only show badge if it's the initial analysis message (no recommendations yet) */}
              {!hasRecommendations && message.analysis.mood && (
                <div className="flex items-center gap-2 animate-[fadeIn_0.5s_ease-out]">
                  <span className="text-xs text-slate-400 font-medium">Sensed Vibe:</span>
                  <MoodBadge mood={message.analysis.mood} className="shadow-sm" />
                </div>
              )}
              
              {/* Render Recommendations if they exist in this message */}
              {hasRecommendations && (
                <Recommendations 
                  music={message.analysis.musicRecommendations || []} 
                  exercises={message.analysis.mindfulExercises}
                  creative={message.analysis.creativeActivity}
                  postures={message.analysis.postures}
                  snack={message.analysis.snackSuggestion}
                  stressTips={message.analysis.stressReliefTips}
                />
              )}
            </div>
          )}
          
          <span className={`text-[10px] text-slate-400 px-1 ${isBot ? 'text-left' : 'text-right'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
