import { StreamData } from "../../types/player";

export class StreamAPI {
  private static async fetchWithTimeout(
    url: string, 
    timeout = 8000
  ): Promise<Response | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response.ok ? response : null;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn("[StreamAPI] Fetch failed:", error);
      return null; // ❌ JAMAIS throw
    }
  }

  static async getStream(matchId: string): Promise<StreamData | null> {
    if (!matchId) return null;

    // Use the actual backend route
    const response = await this.fetchWithTimeout(`/api/admin/saas/editorial/streams/${matchId}`);
    
    if (!response) return { url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", type: "m3u" };

    try {
      const data = await response.json();
      
      // Adapt to array response from the actual backend
      if (Array.isArray(data) && data.length > 0) {
        // Find best stream (prefer facebook/iframe, fallback to m3u)
        const best = data.find(s => s.type === "facebook") 
                  || data.find(s => s.type === "iframe") 
                  || data.find(s => s.type === "m3u")
                  || data[0];
        
        return best && best.url ? best : null;
      }

      return data?.url ? data : { url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", type: "m3u" };
    } catch {
      return { url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", type: "m3u" };
    }
  }

  static async getStreamWithRetry(
    matchId: string,
    maxRetries = 2
  ): Promise<StreamData | null> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const data = await this.getStream(matchId);
      
      if (data) return data;

      // Exponential backoff
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      }
    }

    return null;
  }
}
