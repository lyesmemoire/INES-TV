/**
 * Cloudflare Worker v2 (Final Architecture)
 * Implementation of HMAC Verification & Anti-Replay at the Edge.
 * 
 * Logic:
 * 1. Extract token, exp, and uid from query params.
 * 2. Verify timestamp has not expired.
 * 3. Recompute HMAC and compare with token.
 * 4. Pass through or block.
 */

const SECRET = "your_stream_secret_here"; // MUST match STREAM_SECRET in backend

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Extract credentials
    const token = url.searchParams.get("token");
    const exp = url.searchParams.get("exp");
    const uid = url.searchParams.get("uid");

    if (!token || !exp || !uid) {
      return new Response("Missing security credentials", { status: 403 });
    }

    // 2. Performance: Immediate Expiry check
    if (Date.now() > Number(exp)) {
      return new Response("Token expired", { status: 403 });
    }

    // 3. HMAC Verification
    // Reconstruct payload as constructed in backend: `${urlWithoutParams}|${userId}|${exp}`
    const baseUrl = `${url.origin}${url.pathname}`;
    const payload = `${baseUrl}|${uid}|${exp}`;
    
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.STREAM_SECRET || SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToUint8Array(token),
      new TextEncoder().encode(payload)
    );

    if (!verified) {
      return new Response("Invalid security token", { status: 403 });
    }

    // 4. Authorized -> Proxy to Source
    return fetch(request);
  }
};

/**
 * Utility: Convert Hex string to Uint8Array
 */
function hexToUint8Array(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}
