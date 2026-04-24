/**
 * validateStream
 * Performs a HEAD check on the provided URL to verify reachability.
 */
export const validateStream = async (url: string) => {
  try {
    // We use a AbortController to timeout expensive checks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { 
      method: "HEAD",
      signal: controller.signal,
      mode: 'no-cors' // Common for cross-domain streams
    });

    clearTimeout(timeoutId);

    // Note: status 0 is common for opaque responses (no-cors)
    return {
      ok: res.status < 400 || res.status === 0,
      status: res.status,
    };
  } catch (e) {
    console.warn("[StreamValidator] Failure:", e);
    return {
      ok: false,
      status: 0,
    };
  }
};
