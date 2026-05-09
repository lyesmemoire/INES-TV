import { useEffect } from 'react';

type TVKey =
  | 'ArrowUp' | 'ArrowDown'
  | 'ArrowLeft' | 'ArrowRight'
  | 'Enter' | 'Backspace';

interface UseTVRemoteOptions {
  onKey: (key: TVKey) => void;
  enabled?: boolean;
}

export function useTVRemote({
  onKey,
  enabled = true,
}: UseTVRemoteOptions) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const validKeys: TVKey[] = [
        'ArrowUp', 'ArrowDown',
        'ArrowLeft', 'ArrowRight',
        'Enter', 'Backspace',
      ];

      if (validKeys.includes(e.key as TVKey)) {
        e.preventDefault();
        onKey(e.key as TVKey);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKey, enabled]);
}
