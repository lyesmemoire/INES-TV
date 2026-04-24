/**
 * Cloudflare Worker v3 (Final Production Architecture)
 * Implementation of HMAC Verification, AES Decryption, and HLS Rewriting.
 */

// ─── UTILS ───────────────────────────────────────────────

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function base64urlToBytes(str) {
  const base64 = str
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function bytesToBase64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ─── CONFIG CACHE (Memory) ───────────────────────────────

let cachedHosts = null;
let cacheExpiry = 0;

async function getAllowedHosts(env) {
  if (cachedHosts && Date.now() < cacheExpiry) {
    return cachedHosts;
  }

  try {
    const raw = await env.CONFIG.get("allowed_hosts");
    cachedHosts = (raw ?? "").split(",").map((h) => h.trim());
    cacheExpiry = Date.now() + 60_000; // 60s cache
    return cachedHosts;
  } catch {
    // Fallback constant if KV fails
    return ["provider1.com", "provider2.com"];
  }
}

function isAllowedHost(hostname, hosts) {
  return hosts.some(
    (h) => hostname === h || hostname.endsWith("." + h)
  );
}

/**
 * 🚀 FETCH WITH FAILOVER (NIVEAU ELITE)
 * GET target directly with 3s timeout. Cycles through sources.
 */
async function fetchWithFailover(sources, options = {}) {
  const sourcesList = Array.isArray(sources) ? sources : [sources];
  
  for (const src of sourcesList) {
    try {
      const res = await fetch(src, {
        ...options,
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) return res;
    } catch (err) {
      console.warn(`Source failed: ${src} - ${err.message}`);
    }
  }
  return new Response("All sources down", { status: 503 });
}

// ─── CRYPTO ──────────────────────────────────────────────

async function getAesKey(env) {
  return crypto.subtle.importKey(
    "raw",
    hexToBytes(env.ENCRYPT_KEY_HEX),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
}

async function getHmacKey(env) {
  return crypto.subtle.importKey(
    "raw",
    hexToBytes(env.STREAM_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function decryptToken(token, env) {
  try {
    const combined = base64urlToBytes(token);
    if (combined.length < 28) return null;

    const iv = combined.slice(0, 12);
    const tag = combined.slice(12, 28);
    const encrypted = combined.slice(28);

    const ciphertext = new Uint8Array(encrypted.length + tag.length);
    ciphertext.set(encrypted);
    ciphertext.set(tag, encrypted.length);

    const key = await getAesKey(env);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      key,
      ciphertext
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch {
    return null;
  }
}

async function signSegmentToken(masterToken, segUrl, exp, env) {
  const key = await getHmacKey(env);
  const payload = new TextEncoder().encode(`${masterToken}|${segUrl}|${exp}`);
  const sig = await crypto.subtle.sign("HMAC", key, payload);
  return bytesToBase64url(new Uint8Array(sig));
}

async function verifySegmentToken(masterToken, segUrl, exp, sigToken, env) {
  const expected = await signSegmentToken(masterToken, segUrl, exp, env);
  const a = new TextEncoder().encode(expected);
  const b = new TextEncoder().encode(sigToken);
  return timingSafeEqual(a, b);
}

// ─── M3U8 REWRITING ──────────────────────────────────────

function detectPlaylistType(body) {
  if (body.includes("#EXT-X-STREAM-INF")) return "master";
  if (body.includes("#EXTINF")) return "media";
  return "unknown";
}

function rewriteMasterPlaylist(body, baseUrl, masterToken, exp) {
  return body.split("\n").map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed === "") return line;

    let subUrl;
    try {
      subUrl = new URL(trimmed, baseUrl).href;
    } catch {
      return line;
    }

    return (
      `/proxy-sub` +
      `?url=${encodeURIComponent(subUrl)}` +
      `&t=${encodeURIComponent(masterToken)}` +
      `&exp=${exp}`
    );
  }).join("\n");
}

async function rewriteMediaPlaylist(body, baseUrl, masterToken, exp, env) {
  const lines = body.split("\n");
  const rewritten = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed === "") {
      rewritten.push(line);
      continue;
    }

    let segUrl;
    try {
      segUrl = new URL(trimmed, baseUrl).href;
    } catch {
      rewritten.push(line);
      continue;
    }

    const sig = await signSegmentToken(masterToken, segUrl, exp, env);

    rewritten.push(
      `/proxy-seg` +
      `?url=${encodeURIComponent(segUrl)}` +
      `&mt=${encodeURIComponent(masterToken)}` +
      `&exp=${exp}` +
      `&sig=${sig}`
    );
  }

  return rewritten.join("\n");
}

// ─── HANDLERS ────────────────────────────────────────────

const CORS_HEADERS = (env) => ({
  "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Methods": "GET",
  "Access-Control-Allow-Headers": "Authorization"
});

async function handleM3u8(url, env) {
  const cors = CORS_HEADERS(env);
  const token = url.searchParams.get("t");
  if (!token) return new Response("Forbidden", { status: 403, headers: cors });

  const payload = await decryptToken(token, env);
  if (!payload) return new Response("Invalid token", { status: 403, headers: cors });

  if (Date.now() > payload.exp) return new Response("Expired", { status: 403, headers: cors });

  // 🚀 Upstream Fetch with Failover & Cache
  const upstream = await fetchWithFailover(payload.sourceUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; StreamProxy/2.1)" },
    cf: { cacheTtl: 5, cacheEverything: true }
  });

  if (!upstream.ok) return upstream; // Pass through 503 from failover

  const body = await upstream.text();
  const actualUrl = upstream.url; // Use resolved URL for relative paths
  const baseUrl = actualUrl.substring(0, actualUrl.lastIndexOf("/") + 1);
  const type = detectPlaylistType(body);

  let rewritten;
  if (type === "master") {
    rewritten = rewriteMasterPlaylist(body, baseUrl, token, payload.exp);
  } else if (type === "media") {
    rewritten = await rewriteMediaPlaylist(body, baseUrl, token, payload.exp, env);
  } else {
    rewritten = body;
  }

  return new Response(rewritten, {
    headers: {
      ...cors,
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": "no-store"
    }
  });
}

async function handleSubPlaylist(url, env) {
  const cors = CORS_HEADERS(env);
  const subUrl = url.searchParams.get("url");
  const masterToken = url.searchParams.get("t");
  const exp = url.searchParams.get("exp");

  if (!subUrl || !masterToken || !exp) return new Response("Forbidden", { status: 403, headers: cors });

  if (Date.now() > Number(exp)) return new Response("Expired", { status: 403, headers: cors });

  const hosts = await getAllowedHosts(env);
  const parsed = new URL(subUrl);
  if (!isAllowedHost(parsed.hostname, hosts)) {
    return new Response("Host not allowed", { status: 403, headers: cors });
  }

  const upstream = await fetch(subUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; StreamProxy/2.0)" }
  });

  if (!upstream.ok) return new Response("Fetch failed", { status: 502, headers: cors });

  const body = await upstream.text();
  const baseUrl = subUrl.substring(0, subUrl.lastIndexOf("/") + 1);
  const rewritten = await rewriteMediaPlaylist(body, baseUrl, masterToken, Number(exp), env);

  return new Response(rewritten, {
    headers: {
      ...cors,
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": "no-store"
    }
  });
}

async function handleSegment(url, env) {
  const cors = CORS_HEADERS(env);
  const segUrl = url.searchParams.get("url");
  const masterToken = url.searchParams.get("mt");
  const exp = url.searchParams.get("exp");
  const sig = url.searchParams.get("sig");

  if (!segUrl || !masterToken || !exp || !sig) return new Response("Forbidden", { status: 403, headers: cors });

  if (Date.now() > Number(exp)) return new Response("Expired", { status: 403, headers: cors });

  const valid = await verifySegmentToken(masterToken, segUrl, exp, sig, env);
  if (!valid) return new Response("Invalid signature", { status: 403, headers: cors });

  const hosts = await getAllowedHosts(env);
  const parsed = new URL(segUrl);
  if (!isAllowedHost(parsed.hostname, hosts)) {
    return new Response("Host not allowed", { status: 403, headers: cors });
  }

  const segment = await fetch(segUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; StreamProxy/2.0)" }
  });

  if (!segment.ok) return new Response("Segment failed", { status: 502, headers: cors });

  return new Response(segment.body, {
    headers: {
      ...cors,
      "Content-Type": segment.headers.get("Content-Type") || "video/mp2t",
      "Cache-Control": "private, max-age=60"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = CORS_HEADERS(env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (url.pathname.startsWith("/proxy/")) return handleM3u8(url, env);
    if (url.pathname === "/proxy-sub") return handleSubPlaylist(url, env);
    if (url.pathname === "/proxy-seg") return handleSegment(url, env);

    return new Response("Not found", { status: 404 });
  }
};
