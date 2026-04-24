/**
 * STUB: sportsService.ts
 * Created to unblock server startup.
 * Implements dummy logic for football fixtures and caching.
 */

export async function getLiveFixtures(apiKey: string): Promise<any[]> {
  console.log('[Mock] getLiveFixtures called with key:', apiKey.slice(0, 5) + '...');
  return []; // Return empty to fallback to M3U channels
}

export function maskApiKey(apiKey: string): string {
  if (!apiKey) return '';
  return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
}

export function getCacheInfo(): any {
  return { status: 'mocked', message: 'In-memory cache disabled in stub mode.' };
}

export function invalidateCache(): void {
  console.log('[Mock] Cache invalidated.');
}
