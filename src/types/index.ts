export type DeviceTier = 'LOW' | 'MID' | 'HIGH';
export type NetworkQuality = 'POOR' | 'MODERATE' | 'EXCELLENT';
export type NetworkType = 'WIFI' | 'CELLULAR' | 'UNKNOWN';

export interface StreamSource {
  id: string;
  type: "facebook" | "m3u8" | "youtube" | "mp4" | "rtmp" | "hls" | "dash";
  url: string;
  priority: number; // 1 = highest
  isActive: boolean;
  lastChecked?: Date;
  status: "valid" | "invalid" | "unknown";
  label?: string;
  cdn?: string;
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  viewers: string | number;
  logo: string;
  thumbnail?: string;
  streamSources?: StreamSource[];
  
  // Legacy support
  streamUrl?: string;

  // Match specific
  score?: string;
  homeLogo?: string | null;
  awayLogo?: string | null;
  homeName?: string;
  awayName?: string;
  homeTeam?: string;
  awayTeam?: string;
  league?: string;
  matchTime?: string;
  scheduledAt?: Date | string;
  status?: 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'UPCOMING' | 'FINISHED' | 'ENDED';
  
  isActive?: boolean;
  isPremium?: boolean;
  live?: boolean;
  description?: string;
  slug?: string;

  // Health Monitoring
  healthStatus?: 'ACTIVE' | 'DISABLED' | 'BLOCKED';
  failCount?: number;
  lastChecked?: Date | string;
  lastSuccess?: Date | string;
  lastFailure?: Date | string;

  currentProgram?: { title: string; description?: string } | null;
  liveStats?: {
    elapsedTime: string;
    keyPlayers?: string[];
    upcomingEvents?: { time: string; description: string }[];
  };

  timeline?: { time: string; action: string; team: 'home' | 'away' }[];
  schedule?: { time: string; title: string; isLive?: boolean; description?: string; duration?: string }[];
  highlights?: { title: string; duration: string; thumbnail: string }[];
}

