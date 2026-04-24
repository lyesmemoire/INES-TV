export interface SourceEntry {
  id: string;
  url: string;
  priority: number;
  healthy: boolean;
  load: number;
  provider: string;
}

export interface ChannelMeta {
  name: string;
  type: "live" | "vod";
  plans: string[];
}

export interface ChannelConfig {
  meta: ChannelMeta;
  sources: SourceEntry[];
}

export type SourcesConfig = Record<string, ChannelConfig>;

export interface PickContext {
  channelId: string;
  userId: string;
  userIp: string;
  plan: string;
}
