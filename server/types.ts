export interface M3UChannel {
  id: string;
  name: string;
  category: string;
  viewers: string;
  thumbnail: string;
  streamUrl: string;
}

export interface LiveFixture {
  fixture: { id: number; status: { elapsed: number | null } };
  league: { name: string; logo: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

export interface ApiChannel {
  id: string;
  name: string;
  category: string;
  viewers: string;
  thumbnail: string;
  streamUrl: string;
  score?: string;
  homeLogo?: string;
  awayLogo?: string;
  currentProgram?: { title: string; description?: string } | null;
}

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  message: string;
  data?: T;
}
