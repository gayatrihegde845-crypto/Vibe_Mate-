import React from 'react';
import { Mood } from '../types';
import { Smile, Frown, Meh, Zap, HelpCircle, Heart, Wind, Activity, Sparkles } from './Icons';

interface MoodBadgeProps {
  mood: Mood;
  className?: string;
}

const MoodBadge: React.FC<MoodBadgeProps> = ({ mood, className = '' }) => {
  const getMoodConfig = (m: Mood) => {
    switch (m) {
      case Mood.Happy:
        return { icon: Smile, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50', label: 'Radiant' };
      case Mood.Excited:
        return { icon: Zap, color: 'bg-orange-500/20 text-orange-300 border-orange-500/50', label: 'Energized' };
      case Mood.Sad:
        return { icon: Frown, color: 'bg-blue-500/20 text-blue-300 border-blue-500/50', label: 'Melancholy' };
      case Mood.Stressed:
        return { icon: Wind, color: 'bg-red-500/20 text-red-300 border-red-500/50', label: 'Tense' };
      case Mood.Anxious:
        return { icon: Activity, color: 'bg-purple-500/20 text-purple-300 border-purple-500/50', label: 'Anxious' };
      case Mood.Neutral:
        return { icon: Meh, color: 'bg-slate-500/20 text-slate-300 border-slate-500/50', label: 'Balanced' };
      case Mood.Confused:
        return { icon: HelpCircle, color: 'bg-pink-500/20 text-pink-300 border-pink-500/50', label: 'Confused' };
      default:
        return { icon: Sparkles, color: 'bg-gray-500/20 text-gray-300 border-gray-500/50', label: 'Unclear' };
    }
  };

  const config = getMoodConfig(mood);
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium backdrop-blur-sm ${config.color} ${className}`}>
      <Icon size={14} />
      <span>{config.label}</span>
    </div>
  );
};

export default MoodBadge;