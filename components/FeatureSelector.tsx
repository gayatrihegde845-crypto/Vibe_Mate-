import React from 'react';
import { Music, Activity, Lightbulb, Gamepad2, Armchair } from './Icons';
import { FeatureType } from '../types';

interface FeatureSelectorProps {
  onSelect: (feature: FeatureType) => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({ onSelect }) => {
  const features = [
    { id: FeatureType.Music, label: 'Music', icon: Music, color: 'text-indigo-500', bg: 'bg-white/60', border: 'border-indigo-200' },
    { id: FeatureType.Exercise, label: 'Exercises', icon: Activity, color: 'text-teal-500', bg: 'bg-white/60', border: 'border-teal-200' },
    { id: FeatureType.Posture, label: 'Recommended Aasanas', icon: Armchair, color: 'text-cyan-600', bg: 'bg-white/60', border: 'border-cyan-200', fullWidth: true },
    { id: FeatureType.Pinterest, label: 'AI Creative Tools', icon: Lightbulb, color: 'text-pink-500', bg: 'bg-white/60', border: 'border-pink-200' },
    { id: FeatureType.Game, label: 'Mind Games', icon: Gamepad2, color: 'text-violet-500', bg: 'bg-white/60', border: 'border-violet-200' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md animate-[fadeIn_0.4s_ease-out]">
      {features.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border ${f.border} ${f.bg} hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md backdrop-blur-sm overflow-hidden ${f.fullWidth ? 'col-span-2' : ''}`}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent z-0 pointer-events-none"></div>

          <div className={`relative z-10 p-2 rounded-full bg-white/80 shadow-sm ${f.color}`}>
            <f.icon size={20} />
          </div>
          <span className="relative z-10 text-sm font-semibold text-slate-600">{f.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FeatureSelector;