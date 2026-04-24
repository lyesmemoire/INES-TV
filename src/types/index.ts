export type DeviceTier = 'LOW' | 'MID' | 'HIGH';
export type NetworkQuality = 'POOR' | 'MODERATE' | 'EXCELLENT';
export type NetworkType = 'WIFI' | 'CELLULAR' | 'UNKNOWN';

export interface StreamSource {
  url: string;
  type: 'hls' | 'dash';
  priority?: number;
  label?: string;
  cdn?: string;
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  viewers: string;
  logo: string;

  // ✅ NEW
  streamSources?: StreamSource[];

  // ⚠️ LEGACY (TO REMOVE LATER)
  streamUrl?: string;

  // --- rest unchanged ---
  thumbnail?: string;
  epgId?: string; // Optionnel, pour l’EPG
  score?: string;
  homeLogo?: string;
  awayLogo?: string;
  homeName?: string;
  awayName?: string;
  league?: string;
  matchTime?: string;
  status?: 'LIVE' | 'UPCOMING' | 'FINISHED';
  isActive?: boolean;
  timeline?: { time: string; action: string; team: 'home' | 'away' }[];
  schedule?: { time: string; title: string; isLive?: boolean; description?: string; duration?: string }[];
  highlights?: { title: string; duration: string; thumbnail: string }[];
  currentProgram?: { title: string; description?: string } | null;
  liveStats?: {
    elapsedTime: string;
    keyPlayers: string[];
    upcomingEvents: { time: string; description: string }[];
  };
  isPremium?: boolean;
}

