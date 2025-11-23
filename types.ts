export enum Mood {
  Happy = 'Happy',
  Sad = 'Sad',
  Stressed = 'Stressed',
  Anxious = 'Anxious',
  Excited = 'Excited',
  Neutral = 'Neutral',
  Confused = 'Confused',
  Unclear = 'Unclear',
  Lazy = 'Lazy'
}

export enum FeatureType {
  Music = 'Music',
  Exercise = 'Exercise',
  Pinterest = 'Pinterest',
  Game = 'Game',
  Posture = 'Posture'
}

export interface MusicTrack {
  title: string;
  artist: string;
  vibe: string;
}

export interface Activity {
  title: string;
  description: string;
  duration?: string;
}

export interface CreativeActivity {
  title: string;
  description: string;
  url?: string;
  suggestedPrompt?: string;
}

export interface MiniGame {
  category: 'Logical' | 'Analytical' | 'Critical Thinking';
  title: string;
  description: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  highScore: number; // The simulated high score of previous users
}

export interface PostureItem {
  name: string;
  benefit: string;
  instructions: string;
}

export interface VibeAnalysis {
  mood: Mood;
  confidence: number;
  empatheticResponse: string;
  musicRecommendations?: MusicTrack[];
  mindfulExercises?: Activity[];
  creativeActivity?: CreativeActivity;
  games?: MiniGame[]; // Changed from single miniGame to array
  postures?: PostureItem[];
  snackSuggestion?: string;
  practicalAdvice?: string;
  stressReliefTips?: string[];
  modalityExplanation?: string;
  themeColor: string;
  isFarewell?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  audioUrl?: string;
  imageUrl?: string;
  audioContent?: string; // Base64 raw PCM data for TTS playback
  analysis?: VibeAnalysis;
  isFeatureMenu?: boolean;
  isLanguageMenu?: boolean;
}

export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
}