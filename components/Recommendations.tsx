
import React, { useState } from 'react';
import { MusicTrack, Activity as ActivityType, CreativeActivity, PostureItem } from '../types';
import { Music, Clock, Lightbulb, Palette, Coffee, Sparkles, ExternalLink, Armchair, Check, Copy } from './Icons';

interface RecommendationsProps {
  music: MusicTrack[];
  exercises?: ActivityType[];
  creative?: CreativeActivity;
  // Games removed from here as they have their own page
  postures?: PostureItem[];
  snack?: string;
  stressTips?: string[];
}

// --------------------------------------------------------------------------------
// SVG Diagrams for Postures
// --------------------------------------------------------------------------------
const PostureDiagram: React.FC<{ name: string }> = ({ name }) => {
  const normalizedName = name.toLowerCase();

  // Common style props
  const svgProps = {
    viewBox: "0 0 100 100",
    className: "w-full h-full text-cyan-700",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
  };

  // Virasana (Hero) - Kneeling, sitting between heels
  if (normalizedName.includes('virasana') || normalizedName.includes('hero')) {
    return (
      <svg {...svgProps}>
         {/* Head */}
         <circle cx="50" cy="20" r="10" />
         {/* Torso */}
         <path d="M50 30 L50 65" />
         {/* Arms relaxing on thighs */}
         <path d="M50 35 L30 55 L25 70" />
         <path d="M50 35 L70 55 L75 70" />
         {/* Legs (Kneeling, feet out slightly) */}
         <path d="M50 65 L25 65 L25 90 L15 90" />
         <path d="M50 65 L75 65 L75 90 L85 90" />
      </svg>
    );
  }

  // Vajrasana (Diamond/Thunderbolt) - Kneeling on heels (Side view is clearer for diagram)
  if (normalizedName.includes('vajrasana') || normalizedName.includes('diamond') || normalizedName.includes('stable')) {
    return (
      <svg {...svgProps}>
        {/* Side view head */}
        <circle cx="45" cy="20" r="10" />
        {/* Back (straight) */}
        <path d="M45 30 L45 65" />
        {/* Arm */}
        <path d="M45 35 L65 55" />
        {/* Thigh */}
        <path d="M45 65 L80 65" />
        {/* Shin (folded back under) */}
        <path d="M80 65 L45 90" />
        {/* Foot */}
        <path d="M45 90 L35 90" />
      </svg>
    );
  }

  // Dandasana (Staff Pose) - Sitting L-shape
  if (normalizedName.includes('dandasana') || normalizedName.includes('staff')) {
    return (
      <svg {...svgProps}>
        {/* Head */}
        <circle cx="40" cy="20" r="10" />
        {/* Torso (Straight Back) */}
        <path d="M40 30 L40 65" />
        {/* Legs (Straight Out) */}
        <path d="M40 65 L85 65" />
        {/* Arms (Straight down by hips) */}
        <path d="M40 35 L35 65" />
        {/* Feet */}
        <path d="M85 55 L85 75" strokeWidth="2" />
      </svg>
    );
  }

  // Padmasana (Lotus) - Complex cross legged
  if (normalizedName.includes('padmasana') || normalizedName.includes('lotus')) {
    return (
      <svg {...svgProps}>
        {/* Head */}
        <circle cx="50" cy="20" r="10" />
        {/* Torso */}
        <path d="M50 30 L50 65" />
        {/* Arms in mudra */}
        <path d="M50 38 L20 55 L20 70" />
        <path d="M50 38 L80 55 L80 70" />
        {/* Crossed Legs (Tight) */}
        <path d="M50 65 Q15 65 15 85 L85 85" /> 
        <path d="M50 65 Q85 65 85 85 L15 85" />
      </svg>
    );
  }

  // Swastikasana (Auspicious) - Crossed ankles
  if (normalizedName.includes('swastikasana') || normalizedName.includes('auspicious')) {
    return (
      <svg {...svgProps}>
        {/* Head */}
        <circle cx="50" cy="20" r="10" />
        {/* Torso */}
        <path d="M50 30 L50 65" />
        {/* Arms */}
        <path d="M50 38 L25 55" />
        <path d="M50 38 L75 55" />
        {/* Legs - Simpler cross than lotus */}
        <path d="M50 65 L20 85" /> 
        <path d="M50 65 L80 85" />
        <path d="M20 85 L80 85" strokeDasharray="2,2" /> 
      </svg>
    );
  }

  // Siddhasana (Accomplished) - Heel to perineum
  if (normalizedName.includes('siddhasana') || normalizedName.includes('accomplished')) {
     return (
      <svg {...svgProps}>
        {/* Head */}
        <circle cx="50" cy="20" r="10" />
        {/* Torso */}
        <path d="M50 30 L50 65" />
        {/* Arms resting on knees */}
        <path d="M50 38 L20 60" />
        <path d="M50 38 L80 60" />
        {/* Legs - One heel tucked in close */}
        <path d="M50 65 L30 85 L70 85" />
        <path d="M50 80 L50 85" strokeWidth="5" /> {/* Heel marker */}
      </svg>
    );
  }

  // Gomukhasana (Cow Face) - Stacked knees/arms
  if (normalizedName.includes('gomukhasana') || normalizedName.includes('cow')) {
    return (
       <svg {...svgProps}>
        {/* Head */}
        <circle cx="50" cy="20" r="10" />
        {/* Torso */}
        <path d="M50 30 L50 65" />
        {/* Arms (One up, one down meeting behind back) */}
        <path d="M30 35 L50 30 L50 45" />
        <path d="M70 55 L50 65 L50 55" />
        {/* Legs (Stacked knees) */}
        <path d="M50 65 L25 85 L75 85" />
        <path d="M50 65 L75 85 L25 85" />
      </svg>
    );
  }

  // Default generic sitting
  return (
    <svg {...svgProps}>
      <circle cx="50" cy="20" r="10" />
      <path d="M50 30 L50 65" />
      <path d="M50 65 L25 85" />
      <path d="M50 65 L75 85" />
    </svg>
  );
};

// --------------------------------------------------------------------------------
// SVG Diagrams for Exercises
// --------------------------------------------------------------------------------
const ExerciseDiagram: React.FC<{ name: string, isZumba: boolean }> = ({ name, isZumba }) => {
  const normalized = name.toLowerCase();
  const colorClass = isZumba ? 'text-rose-500' : 'text-teal-600';

  const svgProps = {
    viewBox: "0 0 100 100",
    className: `w-full h-full ${colorClass}`,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
  };

  // Zumba / Dance / Salsa
  if (isZumba || normalized.includes('dance') || normalized.includes('salsa')) {
    return (
      <svg {...svgProps}>
        <circle cx="50" cy="20" r="8" />
        {/* Dynamic Arms */}
        <path d="M50 30 L25 45 L15 25" />
        <path d="M50 30 L75 45 L85 25" />
        <path d="M50 30 L50 60" />
        {/* Dancing Legs */}
        <path d="M50 60 L35 85 L25 80" />
        <path d="M50 60 L65 85 L75 80" />
        {/* Motion lines */}
        <path d="M10 50 Q20 40 10 30" strokeWidth="1.5" opacity="0.6" />
        <path d="M90 50 Q80 40 90 30" strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  }

  // Walking / Running / Jogging
  if (normalized.includes('walk') || normalized.includes('run') || normalized.includes('jog')) {
    return (
      <svg {...svgProps}>
        <circle cx="55" cy="20" r="8" />
        {/* Arms swinging */}
        <path d="M55 30 L40 50 L55 45" />
        <path d="M55 30 L70 50 L55 55" />
        <path d="M55 30 L55 60" />
        {/* Legs running */}
        <path d="M55 60 L30 80 L25 95" />
        <path d="M55 60 L75 80 L85 95" />
        {/* Motion lines behind */}
        <path d="M15 60 L5 60" strokeWidth="1.5" opacity="0.6" />
        <path d="M20 70 L10 70" strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  }

  // Jumping / Cardio / Jacks
  if (normalized.includes('jump') || normalized.includes('cardio') || normalized.includes('jack') || normalized.includes('hiit')) {
    return (
      <svg {...svgProps}>
        <circle cx="50" cy="20" r="8" />
        {/* Arms Up */}
        <path d="M50 30 L20 15" />
        <path d="M50 30 L80 15" />
        <path d="M50 30 L50 60" />
        {/* Legs Out */}
        <path d="M50 60 L20 90" />
        <path d="M50 60 L80 90" />
      </svg>
    );
  }

  // Breathing / Meditation
  if (normalized.includes('breath') || normalized.includes('meditat') || normalized.includes('calm')) {
    return (
      <svg {...svgProps}>
        <circle cx="50" cy="25" r="9" />
        <path d="M50 35 L50 65" />
        <path d="M50 40 L25 55" />
        <path d="M50 40 L75 55" />
        <path d="M50 65 L20 85" />
        <path d="M50 65 L80 85" />
        {/* Breath Arc */}
        <path d="M35 25 Q50 10 65 25" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
    );
  }

  // Default Stretch / Yoga Standing
  return (
    <svg {...svgProps}>
      <circle cx="50" cy="20" r="8" />
      <path d="M50 30 L50 60" />
      {/* Stretching Arms */}
      <path d="M50 35 L20 25" />
      <path d="M50 35 L80 25" />
      {/* Legs */}
      <path d="M50 60 L35 90" />
      <path d="M50 60 L65 90" />
    </svg>
  );
};


export const MusicCard: React.FC<{ track: MusicTrack }> = ({ track }) => {
  const handlePlay = () => {
    const query = `${track.title} ${track.artist}`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div 
        onClick={handlePlay}
        className="flex items-center justify-between p-3 bg-white/40 hover:bg-white/60 border border-white/40 rounded-xl transition-all duration-300 group shadow-sm cursor-pointer"
        title="Play on YouTube"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Music size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-700 truncate">{track.title}</h4>
            <p className="text-xs text-slate-500 truncate">{track.artist}</p>
          </div>
        </div>
        <div className="p-2 rounded-full text-slate-400 group-hover:text-red-500 group-hover:bg-red-50 transition-colors">
          <ExternalLink size={16} className="group-hover:stroke-red-500" />
        </div>
      </div>
  );
};

export const ExerciseCard: React.FC<{ activity: ActivityType, index: number }> = ({ activity, index }) => {
  const isZumba = /zumba|dance|salsa|merengue|reggaeton|shuffle|cumbia|cardio/i.test(activity.title) || 
                  /zumba|dance|music/i.test(activity.description);

  // Use matching layout to PostureCard
  const containerClass = isZumba 
    ? 'bg-rose-50/50 border-rose-200 hover:shadow-rose-100/50' 
    : 'bg-teal-50/50 border-teal-200 hover:shadow-teal-100/50';
  
  const titleClass = isZumba ? 'text-rose-800' : 'text-teal-800';
  const durationClass = isZumba ? 'text-rose-600' : 'text-teal-600';

  return (
    <div className={`${containerClass} border rounded-2xl p-5 flex gap-5 items-start shadow-sm hover:shadow-md transition-all duration-300`}>
      {/* Diagram Area - Consistent with Asana Style */}
      <div className="w-24 h-24 flex-shrink-0 bg-white rounded-xl border border-white/60 p-2 shadow-inner flex items-center justify-center">
        <ExerciseDiagram name={activity.title} isZumba={isZumba} />
      </div>
      
      {/* Content Area - Flex Column, Exactly like PostureCard */}
      <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-1">
        <div className="flex items-center gap-2 mb-2">
           <h4 className={`text-lg font-bold ${titleClass} leading-tight`}>{activity.title}</h4>
        </div>
        
        {activity.duration && (
           <p className={`text-sm font-semibold ${durationClass} mb-2`}>
              {activity.duration}
           </p>
        )}

        <p className="text-sm text-slate-600 leading-relaxed">{activity.description}</p>
      </div>
    </div>
  );
};

export const PostureCard: React.FC<{ posture: PostureItem }> = ({ posture }) => (
  <div className="bg-cyan-50/50 border border-cyan-200 rounded-2xl p-5 flex gap-5 items-start shadow-sm hover:shadow-md transition-shadow">
    {/* Diagram Area - Larger */}
    <div className="w-24 h-24 flex-shrink-0 bg-white rounded-xl border border-cyan-100 p-2 shadow-inner">
      <PostureDiagram name={posture.name} />
    </div>
    
    <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-1">
       <div className="flex items-center gap-2 mb-2">
           <h4 className="text-lg font-bold text-cyan-800 leading-tight">{posture.name}</h4>
        </div>
        <p className="text-sm font-semibold text-cyan-600 mb-2">{posture.benefit}</p>
        <p className="text-sm text-slate-600 leading-relaxed">{posture.instructions}</p>
    </div>
  </div>
);

export const CreativeCard: React.FC<{ activity: CreativeActivity }> = ({ activity }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (activity.suggestedPrompt) {
      navigator.clipboard.writeText(activity.suggestedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (activity.url) {
      window.open(activity.url, '_blank');
    } else {
      // Fallback to search if no specific URL
      window.open(`https://www.google.com/search?q=${encodeURIComponent(activity.title + ' AI Tool')}`, '_blank');
    }
  };

  const isPrompt = !!activity.suggestedPrompt;

  return (
    <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/60 border border-amber-200 rounded-xl p-4 mt-2 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
             {isPrompt ? <Sparkles size={16} /> : <Lightbulb size={16} />}
          </div>
          <span className="text-xs font-bold text-amber-600/90 uppercase tracking-wide">
            {isPrompt ? 'AI Prompt Generator' : 'AI Tool Recommendation'}
          </span>
        </div>
        
        {/* Action Button (Copy or Open) */}
        {isPrompt ? (
          <button 
            onClick={handleCopy}
            className="text-amber-500 hover:text-amber-700 transition-colors"
            title="Copy Prompt"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        ) : (
          <button 
            onClick={handleOpenLink}
            className="text-amber-500 hover:text-amber-700 transition-colors"
            title="Open Tool"
          >
            <ExternalLink size={16} />
          </button>
        )}
      </div>

      <h3 className="text-base font-bold text-slate-700 mb-1">{activity.title}</h3>
      <p className="text-sm text-slate-600 mb-3 leading-snug">{activity.description}</p>
      
      {/* If it's a prompt, show code block */}
      {isPrompt && activity.suggestedPrompt && (
        <div className="relative bg-white/60 border border-amber-100 rounded-lg p-3 mt-2 font-mono text-xs text-slate-600 break-words">
          {activity.suggestedPrompt}
        </div>
      )}
      
      {/* If it's a tool, maybe show URL text nicely */}
      {!isPrompt && (
         <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-white/50 rounded-md border border-amber-200/50 cursor-pointer hover:bg-white transition-colors" onClick={handleOpenLink}>
            <Palette size={12} className="text-amber-500" />
            <span className="text-[10px] text-amber-700/70 font-medium">
              {activity.url ? new URL(activity.url).hostname : 'Search Web'}
            </span>
         </div>
      )}
    </div>
  );
};

const Recommendations: React.FC<RecommendationsProps> = ({ music, exercises, creative, postures, snack, stressTips }) => {
  if (!music.length && !exercises && !creative && !postures) return null;

  return (
    <div className="space-y-3 mt-4 w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
      {/* Music Section */}
      {music.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sonic Vibe</h3>
          <div className="grid gap-2">
            {music.map((track, idx) => (
              <MusicCard key={idx} track={track} />
            ))}
          </div>
        </div>
      )}
      
      {/* Snack / Stress Tips (Stressed/Anxious Context) */}
      {(snack || (stressTips && stressTips.length > 0)) && (
        <div className="grid grid-cols-1 gap-2">
          {snack && (
            <div className="flex items-center gap-3 p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg shadow-sm">
              <div className="p-1.5 bg-emerald-100 rounded-full text-emerald-600">
                <Coffee size={14} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-emerald-600/80 uppercase block">Nourish</span>
                <span className="text-xs text-slate-600">{snack}</span>
              </div>
            </div>
          )}
          {stressTips && stressTips.map((tip, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-blue-50/50 border border-blue-200 rounded-lg shadow-sm">
              <div className="p-1.5 bg-blue-100 rounded-full text-blue-600">
                <Sparkles size={14} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-blue-600/80 uppercase block">Calm & Ground</span>
                <span className="text-xs text-slate-600">{tip}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asanas Section (Renamed from Posture Check) */}
      {postures && postures.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-slate-400 ml-1">
            <Armchair size={14} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Recommended Aasanas</h3>
          </div>
          <div className="flex flex-col gap-3">
            {postures.map((p, idx) => (
              <PostureCard key={idx} posture={p} />
            ))}
          </div>
        </div>
      )}

      {/* Exercises Section */}
      {exercises && exercises.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recommended Exercises</h3>
          <div className="flex flex-col gap-3">
            {exercises.map((ex, idx) => (
              <ExerciseCard key={idx} activity={ex} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Creative Section */}
      {creative && (
        <div className="pt-1">
           <CreativeCard activity={creative} />
        </div>
      )}
    </div>
  );
};

export default Recommendations;
