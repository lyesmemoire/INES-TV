type ChannelMap = Record<string, any>;

const channels: ChannelMap = {};

export function subscribeOnce(key: string, factory: () => any) {
  if (channels[key]) return channels[key];

  const channel = factory();
  channels[key] = channel;

  return channel;
}

export function cleanupChannel(key: string, supabase: any) {
  if (!channels[key]) return;

  supabase.removeChannel(channels[key]);
  delete channels[key];
}

/**
 * Subscribe to Supabase Realtime events with deduplication.
 * Returns an unsubscribe function.
 */
export function subscribeRealtime(opts: {
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  channel: string;
  onData: (payload: any) => void;
}): () => void {
  // Lazy import to avoid SSR issues
  const { getSupabaseBrowserClient } = require("@/src/lib/supabase/client");
  const supabase = getSupabaseBrowserClient();

  const channelKey = `${opts.channel}:${opts.table}:${opts.event}`;

  const sub = subscribeOnce(channelKey, () =>
    supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        { event: opts.event, schema: "public", table: opts.table },
        (payload: any) => opts.onData(payload)
      )
      .subscribe()
  );

  return () => {
    cleanupChannel(channelKey, supabase);
  };
}
