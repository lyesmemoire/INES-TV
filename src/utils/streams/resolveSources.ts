import { Channel, StreamSource } from "@/src/types";

export const resolveSources = (
  channel: Channel,
  signedSources?: StreamSource[]
): StreamSource[] => {
  let sources: StreamSource[] = [];

  if (signedSources?.length) {
    sources = signedSources;
  } else if (channel.streamSources?.length) {
    sources = channel.streamSources;
  } else if (channel.streamUrl) {
    sources = [
      {
        id: "legacy",
        url: channel.streamUrl,
        type: "hls",
        priority: 999,
        isActive: true,
        status: "valid",
        label: "legacy",
      },
    ];
  }

  return sources
    .filter((s) => !!s.url)
    .map((s, index) => ({
      id: s.id || `source-${index + 1}`,
      url: s.url,
      type: s.type || "hls",
      priority: s.priority ?? index + 1,
      isActive: s.isActive ?? true,
      status: s.status || "valid",
      label: s.label ?? `source-${index + 1}`,
      cdn: s.cdn,
    }))
    .sort((a, b) => (a.priority! - b.priority!));
};
