async function hash(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function validateToken(token, request, env) {
  try {
    const [payloadB64, sig] = token.split(".");
    const payload = JSON.parse(atob(payloadB64));

    // 2. CLOCK DRIFT (gros piège TTL tokens)
    const CLOCK_SKEW = 5000; // 5s
    if (Date.now() > payload.exp + CLOCK_SKEW) {
      return { ok: false };
    }

    // IP binding (soft)
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const hashedIp = await hash(ip);

    if (payload.ip !== hashedIp) {
      return { ok: false };
    }

    return {
      ok: true,
      origin: env.ORIGIN + payload.path
    };
  } catch {
    return { ok: false };
  }
}

// 3. SEGMENT FLOOD (attaque silencieuse)
// Simple soft limit logic using KV or Memory footprint depending on Cloudflare Worker plan
const rateLimits = new Map();
async function isFlooding(ip) {
  const now = Date.now();
  const reqs = rateLimits.get(ip) || { count: 0, ts: now };
  
  if (now - reqs.ts > 10000) { // reset every 10s
    reqs.count = 1;
    reqs.ts = now;
  } else {
    reqs.count++;
  }
  
  rateLimits.set(ip, reqs);
  return reqs.count > 50; // Max 50 segments per 10s per IP
}

function rewritePlaylist(content, token) {
  return content
    .split("\n")
    .map(line => {
      if (line.trim().endsWith(".ts") || line.trim().endsWith(".m4s")) {
        return `/hls/segment?token=${token}&url=${encodeURIComponent(line.trim())}`;
      }
      return line;
    })
    .join("\n");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    // Rate Limit protection
    if (await isFlooding(ip)) {
      return new Response("Too many requests", { status: 429 });
    }

    // Segment endpoint logic (anti hotlink)
    if (url.pathname.startsWith("/hls/segment")) {
      const token = url.searchParams.get("token");
      const segmentUrl = url.searchParams.get("url");

      if (!token || !segmentUrl) {
        return new Response("Missing params", { status: 400 });
      }

      const valid = await validateToken(token, request, env);

      // 5. LOGGING SILENCIEUX (ultra important)
      console.log(JSON.stringify({
        type: "segment_request",
        ip,
        valid: valid.ok,
        ts: Date.now()
      }));

      if (!valid.ok) {
        return new Response("Forbidden", { status: 403 });
      }

      const originSegmentUrl = segmentUrl.startsWith("http") 
        ? segmentUrl 
        : `${valid.origin}/${segmentUrl}`.replace(/([^:])\/\//g, "$1/");

      return fetch(originSegmentUrl);
    }

    // Playlist endpoint logic
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Missing token", { status: 403 });
    }

    const valid = await validateToken(token, request, env);

    // 5. LOGGING SILENCIEUX (ultra important)
    console.log(JSON.stringify({
      type: "playlist_request",
      ip,
      valid: valid.ok,
      ts: Date.now()
    }));

    if (!valid.ok) {
      return new Response("Invalid token", { status: 403 });
    }

    const originUrl = valid.origin;

    const res = await fetch(originUrl);

    if (!res.ok) return res;

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("mpegurl")) {
      const text = await res.text();
      const rewritten = rewritePlaylist(text, token);

      return new Response(rewritten, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Cache-Control": "no-store", // Force client to re-request and validate
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // other files
    return fetch(originUrl);
  }
};
