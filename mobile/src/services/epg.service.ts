import { supabase } from './supabase';
import { EPGProgram } from '../types/epg';

/**
 * 🛰️ PRO EPG DATA SERVICE
 * Optimized fetching for the Grid UI.
 */
export const fetchEPGPrograms = async (startTime?: string, endTime?: string): Promise<EPGProgram[]> => {
  let query = supabase
    .from('epg_programs')
    .select('*')
    .order('start_time', { ascending: true });

  if (startTime) {
    query = query.gte('end_time', startTime);
  }
  
  if (endTime) {
    query = query.lte('start_time', endTime);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[EPGService] Fetch error:', error);
    return [];
  }

  return data || [];
};
