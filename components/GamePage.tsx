import React, { useState, useEffect } from 'react';
import { MiniGame } from '../types';
import { generateSingleGame } from '../services/geminiService';
import { ArrowLeft, Trophy, Brain, Zap, Search, Loader2, LogOut, RefreshCw, Check, X, AlertCircle } from './Icons';

interface GamePageProps {
  games?: MiniGame[]; // Optional now as we generate on fly
  onBack: () => void;
}

const CATEGORIES = [
  {
    id: 'Logical',
    title: 'Logical Reasoning',
    desc: 'Master patterns, sequences, and deductive logic.',
    icon: Brain,
    color: 'blue',
    highScore: '9250' // Static "Global" high score for the card
  },
  {
    id: 'Analytical',
    title: 'Analytical Mind',
    desc: 'Interpret data, breakdown problems, and analyze structure.',
    icon: Search,
    color: 'teal',
    highScore: '8840'
  },
  {
    id: 'Critical Thinking',
    title: 'Critical Thinking',
    desc: 'Solve riddles, lateral thinking puzzles, and paradoxes.',
    icon: Zap,
    color: 'rose',
    highScore: '9500'
  }
];

// --------------------------------------------------------------------------
// Sub-Component: Active Game Session
// --------------------------------------------------------------------------
const ActiveGameSession: React.FC<{ category: string; onQuit: () => void }> = ({ category, onQuit }) => {
  const [currentGame, setCurrentGame] = useState<MiniGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const loadNewQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    const game = await generateSingleGame(category);
    if (game) {
      setCurrentGame(game);
    } else {
      // Fallback error handling
      alert("The mind gym is closed momentarily. Please try again.");
      onQuit();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNewQuestion();
  }, [category]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption || !currentGame) return; // Prevent re-answering
    
    setSelectedOption(option);
    const correct = option === currentGame.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 100 + (streak * 10)); // Bonus for streak
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  // Theme helpers based on category - INCREASED OPACITY for White/Light Theme
  const getThemeColors = () => {
    switch(category) {
      case 'Logical': return { bg: 'from-blue-100/90 to-indigo-50/90', accent: 'text-blue-600', btn: 'bg-blue-500' };
      case 'Analytical': return { bg: 'from-teal-100/90 to-emerald-50/90', accent: 'text-teal-600', btn: 'bg-teal-500' };
      case 'Critical Thinking': return { bg: 'from-rose-100/90 to-pink-50/90', accent: 'text-rose-600', btn: 'bg-rose-500' };
      default: return { bg: 'from-slate-100/90 to-gray-50/90', accent: 'text-slate-600', btn: 'bg-slate-500' };
    }
  };

  const theme = getThemeColors();

  return (
    <div className={`flex flex-col w-full h-full bg-gradient-to-br ${theme.bg} animate-[fadeIn_0.5s] overflow-hidden backdrop-blur-md`}>
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm z-20 shrink-0">
        <button 
          onClick={onQuit}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 font-semibold transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-xs uppercase tracking-wider hidden md:inline">Back</span>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{category}</span>
          <div className="flex items-center gap-2">
             <Trophy size={16} className="text-amber-500" />
             <span className="font-bold text-slate-700">{score}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
           <span className="text-xs font-bold hidden md:inline">Streak:</span>
           <span className={`text-sm font-bold ${streak > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>{streak}🔥</span>
        </div>
      </div>

      {/* Game Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full relative z-10">
        <div className="min-h-full w-full flex flex-col items-center py-4">
          
          {loading ? (
            <div className="flex flex-col items-center gap-4 my-auto">
              <Loader2 size={40} className={`${theme.accent} animate-spin`} />
              <p className="text-slate-500 font-medium animate-pulse">Conjuring a challenge...</p>
            </div>
          ) : currentGame ? (
            <div className="w-full max-w-2xl animate-slideUp my-auto">
              
              {/* Question Card */}
              <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-white/50 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                   <div className={`h-full ${theme.btn} transition-all duration-1000 w-full`}></div>
                </div>
                
                {/* Header with Score Badge */}
                <div className="flex justify-between items-start mb-6 gap-4">
                   <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed flex-1">
                      {currentGame.question}
                   </h3>
                   <div className="flex flex-col items-end shrink-0 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Best</span>
                      <span className="text-sm font-bold text-amber-500">{currentGame.highScore}</span>
                   </div>
                </div>
                
                <p className="text-slate-500 italic text-sm mb-2 leading-relaxed">{currentGame.description}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                {currentGame.options.map((opt, idx) => {
                  let btnStyle = "bg-white/60 hover:bg-white/90 border-white/60 text-slate-700";
                  if (selectedOption) {
                    if (opt === currentGame.correctAnswer) btnStyle = "bg-emerald-100/90 border-emerald-300 text-emerald-800 font-bold shadow-inner";
                    else if (opt === selectedOption) btnStyle = "bg-red-100/90 border-red-300 text-red-800 opacity-60";
                    else btnStyle = "bg-slate-50/40 text-slate-300 opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      disabled={!!selectedOption}
                      className={`p-4 rounded-xl border shadow-sm transition-all duration-200 text-left text-base md:text-lg flex justify-between items-center backdrop-blur-sm ${btnStyle}`}
                    >
                      <span className="leading-normal">{opt}</span>
                      {selectedOption && opt === currentGame.correctAnswer && <Check className="text-emerald-600 shrink-0 ml-2" />}
                      {selectedOption && opt === selectedOption && opt !== currentGame.correctAnswer && <X className="text-red-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation / Next Button */}
              {selectedOption && (
                <div className="animate-[fadeIn_0.3s] space-y-4 pb-8">
                  <div className={`p-5 rounded-xl border backdrop-blur-md ${isCorrect ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'}`}>
                     <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? <Check size={20} className="text-emerald-600"/> : <AlertCircle size={20} className="text-amber-600"/>}
                        <span className={`font-bold text-lg ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isCorrect ? 'Brilliant!' : 'Not quite.'}
                        </span>
                     </div>
                     <p className="text-slate-700 text-sm leading-relaxed">{currentGame.explanation}</p>
                  </div>

                  <button 
                    onClick={loadNewQuestion}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${theme.btn}`}
                  >
                    Next Challenge <RefreshCw size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// Main Component: Category Selection & Wrapper
// --------------------------------------------------------------------------
const GamePage: React.FC<GamePageProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // If a category is active, show the game session
  if (activeCategory) {
    return <ActiveGameSession category={activeCategory} onQuit={() => setActiveCategory(null)} />;
  }

  // Otherwise show the Menu
  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white/30 backdrop-blur-md animate-[fadeIn_0.3s_ease-out] relative z-20">
      
      {/* Menu Header */}
      <div className="p-4 md:p-6 flex items-center gap-4 bg-white/60 backdrop-blur-md sticky top-0 z-30 border-b border-white/40 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/60 hover:bg-white/80 text-slate-500 transition-colors border border-white/40 shadow-sm"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Back</span>
        </button>
        <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Mind Gym</h1>
            <p className="text-sm text-slate-500">Select a domain to train your brain</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-4 pb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            // Dynamic color classes based on config - TRANSPARENT BG to show global theme
            // INCREASED OPACITY for White Theme (90%)
            const colorMap: Record<string, string> = {
              blue: 'bg-blue-100/90 hover:bg-blue-200/90 border-blue-200 text-blue-600',
              teal: 'bg-teal-100/90 hover:bg-teal-200/90 border-teal-200 text-teal-600',
              rose: 'bg-rose-100/90 hover:bg-rose-200/90 border-rose-200 text-rose-600',
            };
            const style = colorMap[cat.color];
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-start text-left p-6 rounded-[2rem] border-2 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 backdrop-blur-md ${style}`}
              >
                 <div className={`p-4 rounded-2xl bg-white shadow-sm mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className={style.split(' ').pop()} />
                 </div>
                 
                 <h3 className="text-xl font-bold text-slate-800 mb-2">{cat.title}</h3>
                 <p className="text-slate-600 text-sm mb-6 leading-relaxed min-h-[3rem]">{cat.desc}</p>
                 
                 <div className="w-full mt-auto pt-4 border-t border-slate-300/30 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Score</span>
                    <span className="text-lg font-bold text-amber-500 flex items-center gap-1">
                       <Trophy size={16} /> {cat.highScore}
                    </span>
                 </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-auto mb-8 text-center max-w-md">
           <p className="text-slate-400 text-sm italic">
             "Games are the most elevated form of investigation." <br/> — Albert Einstein
           </p>
        </div>
      </div>
    </div>
  );
};

export default GamePage;