import React, { useState, useEffect, useRef } from 'react';
import { analyzeMood, getFeatureContent, generateSpeech } from './services/geminiService';
import { ChatMessage, VibeAnalysis, Mood, FeatureType, MiniGame } from './types';
import ChatBubble from './components/ChatBubble';
import VoiceInput from './components/VoiceInput';
import EmojiInput from './components/EmojiInput';
import FeatureSelector from './components/FeatureSelector';
import LanguageSelector from './components/LanguageSelector';
import GamePage from './components/GamePage';
import { Send, Sparkles, Loader2, Mic, Keyboard, Smile, ArrowLeft, X } from './components/Icons';

// ---------------------------------------------------------------------------
// Welcome Screen Component
// ---------------------------------------------------------------------------
const WelcomeScreen: React.FC<{ onComplete: (name: string) => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Automatically capitalize the first letter
    if (val.length > 0) {
      setName(val.charAt(0).toUpperCase() + val.slice(1));
    } else {
      setName(val);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 text-center space-y-8 animate-[fadeIn_0.8s_ease-out] z-10 relative">
      
      {/* Decorative Blob Overlay - Deep Philodendron Green Theme */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-cyan-900/10 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
          <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-teal-800/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[15%] left-[20%] w-80 h-80 bg-emerald-900/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md p-10 rounded-[2.5rem] leaf-shadow-inset flex flex-col items-center space-y-8 relative z-10 shadow-2xl shadow-emerald-900/10 border border-white/50 backdrop-blur-xl bg-white/40">
        {/* Decorative blur orb inside card */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-white/40 to-emerald-100/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="p-6 bg-gradient-to-br from-white to-emerald-50 rounded-full shadow-lg border border-emerald-50 relative z-10 ring-4 ring-white/40">
          <Sparkles className="text-emerald-600" size={40} />
        </div>
        
        <div className="space-y-4 relative z-10">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight font-sans drop-shadow-sm">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-700">VibeMate</span>
          </h1>
          <p className="text-slate-600 font-medium leading-relaxed text-lg">
            A calm space to understand your feelings.
          </p>
        </div>
        
        <div className="w-full space-y-5 relative z-10 pt-2">
          <div className="relative group">
             <div className="absolute inset-0 bg-emerald-200 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
             <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="What's your name?"
                className="relative w-full px-6 py-5 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl text-center text-slate-800 placeholder:text-slate-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 shadow-sm transition-all text-xl font-medium"
                onKeyDown={(e) => e.key === 'Enter' && name.trim() && onComplete(name)}
              />
          </div>
          
          <button
            onClick={() => name.trim() && onComplete(name)}
            disabled={!name.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide shadow-lg transition-all duration-300 ${
              name.trim() 
                ? 'bg-[#2d4a3e] text-white hover:bg-[#1a2e26] hover:shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Begin Journey
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main App Component
// ---------------------------------------------------------------------------
type AppMode = 'welcome' | 'selection' | 'input-voice' | 'input-text' | 'input-emoji' | 'chat' | 'game-page';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  // State to track the flow
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [userContext, setUserContext] = useState<string>(''); // Tracks original user input
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  // Session Types
  const [isVoiceSession, setIsVoiceSession] = useState(false); 
  const [isEmojiSession, setIsEmojiSession] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // New state for collapsing picker
  
  // In-chat input state
  const [chatInput, setChatInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showFeatureMenu, showLanguageMenu, isLoading, showEmojiPicker]);

  const handleNameSet = (name: string) => {
    setUserName(name);
    setMode('selection');
  };

  const handleModeSelect = (selectedMode: AppMode) => {
    // Handle Emoji Mode specifically: Switch to chat immediately so footer handles input
    if (selectedMode === 'input-emoji') {
      setMode('chat');
      setIsEmojiSession(true);
      setIsVoiceSession(false);
      setShowEmojiPicker(false); // Start collapsed
    } else {
      setMode(selectedMode);
      
      if (selectedMode === 'input-voice') {
        setIsVoiceSession(true);
        setIsEmojiSession(false);
      } else {
        setIsVoiceSession(false);
        setIsEmojiSession(false);
      }
    }
  };

  const resetFlow = () => {
    setMessages([]);
    setCurrentMood(null);
    setUserContext('');
    setShowFeatureMenu(false);
    setShowLanguageMenu(false);
    setIsVoiceSession(false);
    setIsEmojiSession(false);
    setShowEmojiPicker(false);
    setMode('selection');
    setTextInput('');
    setChatInput('');
  };

  // -------------------------------------------------------------------------
  // Step 1: Analyze Mood (First Interaction or In-Chat Interaction)
  // -------------------------------------------------------------------------
  const handleAnalysis = async (input: string | Blob, type: 'text' | 'image' | 'emoji' | 'audio') => {
    setIsLoading(true);
    setMode('chat');
    setShowFeatureMenu(false);
    setShowLanguageMenu(false);
    
    if (type === 'emoji') {
       setShowEmojiPicker(false); // Auto-collapse picker to show chat/story
    }

    let textPrompt = '';
    let mediaData: string | undefined;
    let displayUrl: string | undefined;
    
    // Save context for feature generation later
    if (type === 'text') {
      setUserContext(input as string);
    } else if (type === 'emoji') {
      setUserContext(`User selected emoji: ${input}`);
    } else if (type === 'image') {
      setUserContext('User provided an image expression');
    } else if (type === 'audio') {
       setUserContext('User provided an audio message');
    }

    // 1. Create User Message
    if (type === 'text' || type === 'emoji') {
      textPrompt = input as string;
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: textPrompt,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMsg]);
    } else if (type === 'image') {
       // Kept for types compatibility but unused in UI now
      const imageBlob = input as Blob;
      displayUrl = URL.createObjectURL(imageBlob);
      mediaData = await blobToBase64(imageBlob);
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: "",
        imageUrl: displayUrl,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMsg]);
    } else if (type === 'audio') {
        const audioBlob = input as Blob;
        mediaData = await blobToBase64(audioBlob);
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: "🎤 Audio Message",
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);
    }

    // 2. API Call - Mood Only
    try {
      const analysis = await analyzeMood(
        textPrompt, 
        type,
        mediaData,
        userName || 'Friend'
      );

      setCurrentMood(analysis.mood);
      
      // Prepare ID for bot message so we can update it later
      const botMsgId = (Date.now() + 1).toString();

      // 3. Create Bot Response IMMEDIATE (Text Only first)
      // This speeds up perceived loading time significantly
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        text: "", 
        analysis: analysis,
        audioContent: undefined, // Will be populated async
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false); // Stop main loader immediately

      // 4. Async Audio Generation (Background)
      // If it's a voice session, generate Audio Reply (TTS) in background
      if (type === 'audio' && analysis.empatheticResponse) {
         generateSpeech(analysis.empatheticResponse).then((audioData) => {
            if (audioData) {
               setMessages(prev => prev.map(msg => 
                  msg.id === botMsgId 
                    ? { ...msg, audioContent: audioData } 
                    : msg
               ));
            }
         });
      }
      
      // 5. Check for Farewell
      if (analysis.isFarewell) {
        // Wait a bit for user to read/hear response, then reset
        setTimeout(() => {
          resetFlow();
        }, 3500);
        return; // Do not show feature menu
      }
      
      // 6. Show Features after a brief delay for effect
      setTimeout(() => {
        setShowFeatureMenu(true);
      }, 500);

    } catch (error) {
      console.error("Error in analysis:", error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        text: "I felt a little disconnect. Could you try sharing that with me again?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    } finally {
      setTextInput('');
    }
  };

  // -------------------------------------------------------------------------
  // Handle Chat Input (Bottom Bar)
  // -------------------------------------------------------------------------
  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    const text = chatInput;
    setChatInput('');
    handleAnalysis(text, 'text');
  };

  // -------------------------------------------------------------------------
  // Step 2: Handle Feature Selection
  // -------------------------------------------------------------------------
  const handleFeatureSelect = (feature: FeatureType) => {
    setShowFeatureMenu(false); // Hide menu
    
    if (feature === FeatureType.Game) {
       // Direct Redirect to Game Page
       setMode('game-page');
    } else {
      // Standard handling (Chat Bubbles)
      const actionMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: `I'd like to see ${feature === FeatureType.Pinterest ? 'Creative Ideas' : feature}.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, actionMsg]);

      if (feature === FeatureType.Music) {
        // If Music, strictly show language menu next
        setTimeout(() => setShowLanguageMenu(true), 300);
      } else {
        // Otherwise, fetch content immediately
        fetchFeatureContent(feature);
      }
    }
  };

  // -------------------------------------------------------------------------
  // Step 3: Handle Language Selection (Music Only)
  // -------------------------------------------------------------------------
  const handleLanguageSelect = (lang: string) => {
    setShowLanguageMenu(false);
    
    const langMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: `${lang} music, please.`,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, langMsg]);

    fetchFeatureContent(FeatureType.Music, lang);
  };

  // -------------------------------------------------------------------------
  // Step 4: Fetch Feature Content (Standard)
  // -------------------------------------------------------------------------
  const fetchFeatureContent = async (feature: FeatureType, lang?: string) => {
    if (!currentMood) return;

    setIsLoading(true);

    try {
      // Pass userContext so AI knows if user asked for specific songs
      const content = await getFeatureContent(currentMood, feature, lang, userContext);
      
      // Construct response with just the recommendation data
      const responseText = feature === FeatureType.Music 
          ? `Here are some ${lang} tunes to match your vibe.` 
          : `Here is something special for you.`;

      const analysisData: Partial<VibeAnalysis> = {
        mood: currentMood, // Keep mood context
        confidence: 1,
        empatheticResponse: responseText,
        themeColor: "#10b981",
        ...content
      };

      const botMsgId = (Date.now() + 1).toString();

      // Show content immediately (Text/UI)
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        text: "",
        analysis: analysisData as VibeAnalysis,
        audioContent: undefined,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false); // Stop loading
      
      // Async Audio Fetch if Voice Session
      if (isVoiceSession) {
          generateSpeech(responseText).then(audioData => {
             if (audioData) {
                setMessages(prev => prev.map(m => 
                   m.id === botMsgId 
                     ? { ...m, audioContent: audioData }
                     : m
                ));
             }
          });
      }
      
      // Re-show menu
      setTimeout(() => setShowFeatureMenu(true), 1500);

    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else reject(new Error("Failed to convert blob"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // ---------------------------------------------------------------------------
  // Render Logic
  // ---------------------------------------------------------------------------

  if (mode === 'game-page') {
    return <GamePage onBack={() => setMode('chat')} />;
  }

  return (
    <div className="relative w-full h-screen flex flex-col items-center overflow-hidden font-sans">
      
      {/* 
         The background logic is now fully handled in index.html via global CSS 
         (.monstera-bg and .leaf-shadow-container).
      */}

      {/* Header */}
      {userName && (
        <header className="w-full p-4 md:p-6 flex justify-between items-center z-20">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/70 rounded-xl border border-white/60 backdrop-blur-sm shadow-sm text-emerald-700">
                <Sparkles size={20} />
              </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-slate-800 tracking-tight leading-tight">VibeMate</h1>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Hi, {userName}</span>
            </div>
          </div>
          {mode !== 'selection' && (
            <button 
              onClick={resetFlow} 
              className="text-xs font-bold text-slate-500 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1 transition-colors bg-white/50 px-3 py-1.5 rounded-lg border border-white/60"
              disabled={isLoading}
            >
              <ArrowLeft size={12} /> Back
            </button>
          )}
        </header>
      )}

      {/* Main Content Area - EXTENDED WIDTH (max-w-4xl) */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center p-4 relative z-10 h-full overflow-hidden">
        
        {/* 1. Welcome Screen */}
        {mode === 'welcome' && (
          <WelcomeScreen onComplete={handleNameSet} />
        )}

        {/* 2. Mode Selection Screen */}
        {mode === 'selection' && (
          <div className="flex flex-col items-center w-full space-y-8 animate-slideUp">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-slate-800">Hi {userName}</h2>
              <p className="text-slate-600">How would you like to share your feelings today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              
              {/* Card 1: Voice Assistant */}
              <button 
                onClick={() => handleModeSelect('input-voice')}
                className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl transition-all duration-500 
                shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-white/60 leaf-shadow-inset bg-white/30 backdrop-blur-md
                hover:shadow-[0_25px_50px_-12px_rgba(45,74,62,0.25)] hover:bg-[#2d4a3e]/5 hover:-translate-y-2 hover:scale-105 hover:border-[#2d4a3e]/10 overflow-hidden"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 pointer-events-none"></div>

                <div className="relative z-10 p-5 bg-[#e2e8e0]/20 text-[#354f42] rounded-2xl group-hover:bg-white/40 group-hover:text-[#2d4a3e] group-hover:scale-110 transition-all duration-300 shadow-sm border border-[#354f42]/5 group-hover:border-white/40">
                  <Mic size={36} />
                </div>
                <span className="relative z-10 font-bold text-xl text-[#354f42] group-hover:text-[#2d4a3e] transition-colors tracking-wide">Voice Assistant</span>
              </button>

              {/* Card 2: Text */}
              <button 
                onClick={() => handleModeSelect('input-text')}
                className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl transition-all duration-500 
                shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-white/60 leaf-shadow-inset bg-white/30 backdrop-blur-md
                hover:shadow-[0_25px_50px_-12px_rgba(45,74,62,0.25)] hover:bg-[#2d4a3e]/5 hover:-translate-y-2 hover:scale-105 hover:border-[#2d4a3e]/10 overflow-hidden"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 pointer-events-none"></div>

                <div className="relative z-10 p-5 bg-[#e2e8e0]/20 text-[#354f42] rounded-2xl group-hover:bg-white/40 group-hover:text-[#2d4a3e] group-hover:scale-110 transition-all duration-300 shadow-sm border border-[#354f42]/5 group-hover:border-white/40">
                  <Keyboard size={36} />
                </div>
                <span className="relative z-10 font-bold text-xl text-[#354f42] group-hover:text-[#2d4a3e] transition-colors tracking-wide">Text Input</span>
              </button>

               {/* Card 3: Emoji */}
               <button 
                onClick={() => handleModeSelect('input-emoji')}
                className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl transition-all duration-500 
                shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-white/60 leaf-shadow-inset bg-white/30 backdrop-blur-md
                hover:shadow-[0_25px_50px_-12px_rgba(45,74,62,0.25)] hover:bg-[#2d4a3e]/5 hover:-translate-y-2 hover:scale-105 hover:border-[#2d4a3e]/10 overflow-hidden"
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 pointer-events-none"></div>

                <div className="relative z-10 p-5 bg-[#e2e8e0]/20 text-[#354f42] rounded-2xl group-hover:bg-white/40 group-hover:text-[#2d4a3e] group-hover:scale-110 transition-all duration-300 shadow-sm border border-[#354f42]/5 group-hover:border-white/40">
                  <Smile size={36} />
                </div>
                <span className="relative z-10 font-bold text-xl text-[#354f42] group-hover:text-[#2d4a3e] transition-colors tracking-wide">Emoji Picker</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Specific Inputs */}
        
        {/* A. Voice Input Mode */}
        {mode === 'input-voice' && (
          <div className="w-full h-full flex flex-col items-center animate-[fadeIn_0.3s]">
            {/* Header handled by main layout */}
            <div className="w-full h-full max-h-[60vh] max-w-md p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center leaf-shadow-inset relative overflow-hidden">
               {/* Decorative Background Elements inside the card */}
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-50/20 to-transparent pointer-events-none"></div>
               
               <VoiceInput 
                  onAudioCapture={(blob) => handleAnalysis(blob, 'audio')} 
                  isProcessing={isLoading} 
               />
            </div>
          </div>
        )}

        {/* B. Text Input Mode */}
        {mode === 'input-text' && (
          <div className="w-full max-w-lg flex flex-col items-center animate-[fadeIn_0.3s]">
            <div className="w-full p-6 rounded-3xl shadow-sm leaf-shadow-inset relative">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type how you're feeling..."
                className="w-full h-32 bg-white/40 rounded-xl p-4 border border-slate-200 outline-none text-lg text-slate-800 placeholder:text-slate-500 resize-none focus:bg-white/60 focus:border-emerald-300 transition-colors"
                autoFocus
              />
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => textInput.trim() && handleAnalysis(textInput, 'text')}
                  disabled={!textInput.trim()}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md ${
                    textInput.trim()
                      ? 'bg-[#2d4a3e] text-white hover:bg-[#1a2e26] hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Analyze <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Chat / Result Screen */}
        {mode === 'chat' && (
          <div className="flex flex-col w-full h-full relative">
             {/* Chat Messages */}
             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-32 relative">
                {messages.map((msg, index) => (
                  <ChatBubble 
                    key={msg.id} 
                    message={msg} 
                    isLatest={index === messages.length - 1} 
                  />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start w-full mb-6 animate-pulse">
                    <div className="flex items-center gap-3 bg-white/60 px-5 py-4 rounded-2xl rounded-tl-none border border-white/50 shadow-sm">
                      <Loader2 className="animate-spin text-emerald-600" size={18} />
                      <span className="text-sm text-slate-600 font-medium">Listening to the leaves...</span>
                    </div>
                  </div>
                )}

                {/* Interactions Area (Bottom of chat - injected after messages) */}
                <div className="w-full flex flex-col items-center gap-4 mt-4">
                  {/* FEATURE SELECTOR: Hidden if in Voice Session or Emoji Session */}
                  {showFeatureMenu && !isLoading && !isVoiceSession && !isEmojiSession && (
                     <div className="flex flex-col items-center gap-2 w-full animate-slideUp mb-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Explore Support</span>
                        <FeatureSelector onSelect={handleFeatureSelect} />
                     </div>
                  )}

                  {showLanguageMenu && !isLoading && (
                    <div className="mb-4 w-full flex justify-center">
                        <LanguageSelector onSelect={handleLanguageSelect} />
                    </div>
                  )}
                </div>

                <div ref={messagesEndRef} />
             </div>

             {/* Sticky Input Bar */}
             <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-white via-white/90 to-transparent pt-8">
                
                {/* CONDITIONAL FOOTER: Voice vs Emoji vs Text */}
                {isVoiceSession ? (
                  // Voice Only Footer
                  <div className="flex justify-center w-full">
                     <button 
                       onClick={() => setMode('input-voice')} 
                       disabled={isLoading}
                       className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#2d4a3e] text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                     >
                        <Mic size={24} />
                        <span className="font-bold text-lg">Reply</span>
                     </button>
                  </div>
                ) : isEmojiSession ? (
                   // Emoji Only Footer - Toggleable
                   <div className="w-full flex flex-col items-center animate-slideUp">
                      {!showEmojiPicker ? (
                        <button
                          onClick={() => setShowEmojiPicker(true)}
                          className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg hover:scale-105 transition-all text-[#354f42] font-bold group"
                        >
                          <span className="bg-[#e2e8e0] text-[#2d4a3e] p-2 rounded-full group-hover:rotate-12 transition-transform border border-[#354f42]/10">
                            <Smile size={24} />
                          </span>
                          <span>Pick a Mood</span>
                        </button>
                      ) : (
                        <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 rounded-[2rem] p-4 shadow-2xl mx-auto max-w-2xl w-full animate-[slideUp_0.3s]">
                           {/* Close handle/button */}
                           <div className="absolute top-2 right-2 flex justify-end z-10">
                              <button 
                                onClick={() => setShowEmojiPicker(false)}
                                className="p-2 bg-slate-100/80 backdrop-blur rounded-full text-slate-500 hover:text-emerald-600 shadow-sm hover:scale-110 transition-all"
                              >
                                <X size={18} />
                              </button>
                           </div>
                           
                           <div className="mb-2 text-center mt-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tap an emoji to generate story</span>
                           </div>

                           <EmojiInput 
                             onSelect={(emoji) => {
                               handleAnalysis(emoji, 'emoji');
                             }} 
                             compact={true} 
                           />
                        </div>
                      )}
                   </div>
                ) : (
                  // Standard Text Footer
                  <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-2 shadow-sm hover:shadow-md transition-shadow">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                      placeholder="Ask anything..."
                      className="flex-1 bg-transparent px-4 py-2 text-slate-800 placeholder:text-slate-500 focus:outline-none"
                      disabled={isLoading}
                    />
                    <button 
                      onClick={handleChatSubmit}
                      disabled={!chatInput.trim() || isLoading}
                      className={`p-2.5 rounded-xl transition-colors ${
                        chatInput.trim() && !isLoading
                          ? 'bg-[#2d4a3e] text-white hover:bg-[#1a2e26]' 
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                )}

             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;