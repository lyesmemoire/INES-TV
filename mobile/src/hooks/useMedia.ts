import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

/**
 * 🛰️ HOOK: useMedia
 * Fetches VOD (Movies) and Series catalog.
 */
export function useMedia() {
  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const { data: moviesData } = await supabase.from('movies').select('*').limit(20);
      const { data: seriesData } = await supabase.from('series').select('*').limit(20);

      setMovies(moviesData || []);
      setSeries(seriesData || []);
    } catch (err) {
      console.error('[useMedia] Fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  return { movies, series, isLoading, refresh: fetchMedia };
}
