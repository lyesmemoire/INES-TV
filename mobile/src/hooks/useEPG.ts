import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface EPGProgram {
  id: string;
  channel_id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
}

/**
 * 🛰️ PRO EPG HOOK (Staff Engineer Edition)
 * Fetches current and next program with real-time refresh logic.
 */
export const useEPG = (channelName: string | undefined) => {
  return useQuery({
    queryKey: ['epg', channelName],
    queryFn: async () => {
      if (!channelName) return null;

      const now = new Date().toISOString();

      // Fetch current program
      const { data: current, error: curErr } = await supabase
        .from('epg_programs')
        .select('*')
        .eq('channel_name', channelName) // We use channel_name for easier mapping if IDs differ
        .lte('start_time', now)
        .gte('end_time', now)
        .single();

      // Fetch next program
      const { data: next, error: nextErr } = await supabase
        .from('epg_programs')
        .select('*')
        .eq('channel_name', channelName)
        .gt('start_time', now)
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

      return {
        current: current || null,
        next: next || null,
      };
    },
    enabled: !!channelName,
    refetchInterval: 30000, // 30 seconds
    staleTime: 60000,      // 1 minute
  });
};
