import { Channel, StreamSource } from "@/types";

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
        url: channel.streamUrl,
        type: "hls",
        priority: 999,
        label: "legacy",
      },
    ];
  }

  return sources
    .filter((s) => !!s.url)
    .map((s, index) => ({
      url: s.url,
      type: s.type || "hls",
      priority: s.priority ?? index + 1,
      label: s.label ?? `source-${index + 1}`,
      cdn: s.cdn,
    }))
    .sort((a, b) => (a.priority! - b.priority!));
};
