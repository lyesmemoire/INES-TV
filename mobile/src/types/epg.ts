export type EPGProgram = {
  id: string;
  channel_id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
};

export type EPGChannel = {
  id: string;
  name: string;
  logo?: string;
};

export type EPGCell = {
  program: EPGProgram;
  left: number;
  width: number;
  isLive: boolean;
  status: "past" | "live" | "future"; // Keeping status for logical richness
};
