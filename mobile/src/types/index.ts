// Shared types with web — keep in sync with src/types/index.ts
export type DeviceTier = 'LOW' | 'MID' | 'HIGH';
export type NetworkQuality = 'POOR' | 'MODERATE' | 'EXCELLENT';
export type NetworkType = 'WIFI' | 'CELLULAR' | 'OFFLINE';

export interface ScheduleItem {
  time: string;
  title: string;
  isLive: boolean;
  description?: string;
  duration?: string;
}

export interface Highlight {
  title: string;
  duration: string;
  thumbnail: string;
}

export interface LiveStats {
  elapsedTime?: string;
  keyPlayers?: string[];
  upcomingEvents?: Array<{ time: string; description: string }>;
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  viewers: string;
  thumbnail: string;
  streamUrl: string;
  score?: string;
  homeLogo?: string;
  awayLogo?: string;
  homeName?: string;
  awayName?: string;
  league?: string;
  matchTime?: string;
  status?: 'LIVE' | 'UPCOMING' | 'FINISHED';
  timeline?: { time: string; action: string; team: 'home' | 'away' }[];
  schedule?: ScheduleItem[];
  highlights?: Highlight[];
  currentProgram?: { title: string; description?: string } | null;
  liveStats?: LiveStats;
}

export interface ApiChannelsResponse {
  status: 'ok' | 'error';
  message: string;
  key_preview: string;
  channels: Channel[];
}
