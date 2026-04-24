import { Channel, ApiChannelsResponse } from '../types';

// Replace with your production URL
const isDev = process.env.NODE_ENV !== 'production';
const BASE_URL = isDev ? 'http://10.0.2.2:3000' : 'https://your-production-api.com';

/**
 * Fetch live channels from the backend.
 * Uses Android emulator loopback (10.0.2.2) in dev, real URL in prod.
 */
export async function fetchLiveChannels(): Promise<Channel[]> {
  const response = await fetch(`${BASE_URL}/api/live-channels`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  const data: ApiChannelsResponse = await response.json();

  if (data.status !== 'ok' || !data.channels?.length) {
    throw new Error(data.message || 'No channels returned');
  }

  return data.channels;
}

export async function fetchHealthCheck(): Promise<{ status: string; uptime: number }> {
  const response = await fetch(`${BASE_URL}/api/health`);
  return response.json();
}
/**
 * Fetch history for a specific channel to get continuity position.
 */
export async function fetchChannelHistory(token: string, channelId: string): Promise<{ lastPosition: number }> {
  try {
    const response = await fetch(`${BASE_URL}/api/history/${channelId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data || { lastPosition: 0 };
  } catch (e) {
    return { lastPosition: 0 };
  }
}

/**
 * Record watch progress (every few seconds).
 */
export async function recordWatchHistory(token: string, channelId: string, channelData: any, lastPosition?: number): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        channelId, 
        channelData, 
        lastPosition,
      })
    });
  } catch (e) {
    console.error('[History] Failed to record', e);
  }
}

/**
 * Fetch a short-lived signed token for a specific stream.
 * Prevents URL sharing and direct harvesting of stream URLs.
 */
export async function fetchStreamToken(token: string, channelId: string): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/stream-token?channelId=${channelId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.token || null;
  } catch (e) {
    console.error('[Security] Failed to fetch stream token', e);
    return null;
  }
}
