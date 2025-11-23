import React from 'react';
import { Globe } from './Icons';

interface LanguageSelectorProps {
  onSelect: (lang: string) => void;
}

const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Telugu'];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md animate-[fadeIn_0.4s_ease-out] bg-white/40 p-5 rounded-3xl border border-white/50 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
        <Globe size={14} />
        <span>Select Music Language</span>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className="px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border bg-white text-slate-600 border-slate-100 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md"
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;