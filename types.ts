export interface ThumbnailConfig {
  text: string;
  subText: string;
  chaosLevel: number; // 1-100
  theme: 'defeat' | 'victory' | 'funny' | 'glitch';
  aspectRatio: '9:16' | '16:9' | '1:1';
  includeAudio: boolean;
}

export interface GenerationResult {
  imageUrl: string | null;
  audioUrl: string | null;
  loading: boolean;
  error: string | null;
}

export enum ThemeColors {
  DEFEAT = 'from-red-600 to-orange-600',
  VICTORY = 'from-blue-500 to-cyan-400',
  FUNNY = 'from-yellow-400 to-orange-500',
  GLITCH = 'from-purple-600 to-pink-500',
}