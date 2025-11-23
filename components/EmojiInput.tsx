import React from 'react';

interface EmojiInputProps {
  onSelect: (emoji: string) => void;
  compact?: boolean;
}

const EMOJIS = [
  { char: '😊', label: 'Happy' },
  { char: '😔', label: 'Sad' },
  { char: '😫', label: 'Tired' },
  { char: '😤', label: 'Frustrated' },
  { char: '🤯', label: 'Overwhelmed' },
  { char: '😌', label: 'Calm' },
  { char: '🤔', label: 'Confused' },
  { char: '😴', label: 'Sleepy' },
  { char: '🤩', label: 'Excited' },
  { char: '😐', label: 'Neutral' },
  { char: '😰', label: 'Anxious' },
  { char: '🥰', label: 'Loved' },
];

const EmojiInput: React.FC<EmojiInputProps> = ({ onSelect, compact = false }) => {
  return (
    <div className="w-full">
      {!compact && (
        <h3 className="text-center text-[#354f42]/80 font-semibold mb-6 tracking-tight">Pick the one that matches your vibe</h3>
      )}
      <div className={`grid ${compact ? 'grid-cols-6 gap-2' : 'grid-cols-4 gap-3 md:gap-4'}`}>
        {EMOJIS.map((item) => (
          <button
            key={item.char}
            onClick={() => onSelect(item.char)}
            className={`group flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 shadow-sm aspect-square 
            bg-[#2d4a3e]/5 border-[#2d4a3e]/10 
            hover:bg-[#2d4a3e]/10 hover:border-[#2d4a3e]/30 hover:scale-105 hover:shadow-[#2d4a3e]/10
            ${compact ? 'p-1 gap-0.5' : 'p-2.5 gap-1.5'}`}
          >
            {/* 
               VINTAGE FILTER: 
               sepia(1) -> makes it brown/monochrome
               hue-rotate(70deg) -> shifts brown to sage green
               saturate(0.8) -> tones down intensity
               contrast(0.9) -> softens edges
            */}
            <span className={`transition-all duration-300 filter sepia-[0.8] hue-rotate-[70deg] saturate-[0.7] contrast-[0.9] brightness-[0.95] group-hover:brightness-[1.1] group-hover:scale-110 ${compact ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
              {item.char}
            </span>
            {!compact && (
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-[#354f42]/60 font-bold group-hover:text-[#2d4a3e] truncate w-full text-center">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiInput;