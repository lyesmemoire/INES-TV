/**
 * 🔒 STREAMPERF EDGE PROXY (v2.5 Hardened)
 * 🚀 Cloudflare Worker for Secure Origin Masking & IP Binding
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) return new Response("Forbidden: Missing Token", { status: 403 })

    try {
      const data = await decrypt(token, env.STREAM_SECRET) // your AES decrypt

      if (Date.now() > data.exp) {
        return new Response("Expired", { status: 403 });
      }

      const ip = request.headers.get("CF-Connecting-IP")
      if (data.ip && data.ip !== ip) {
        return new Response("IP Mismatch", { status: 403 });
      }

      return fetch(data.url || data.sourceUrl, {
        headers: {
          "User-Agent": "StreamPerf-Edge/2.5",
          "Referer": env.SITE_URL || "https://streamperf.pro"
        }
      });
    } catch (err) {
      console.error("[Decrypt Error]", err)
      return new Response("Forbidden: Invalid Integrity", { status: 403 })
    }
  }
}

/**
 * 🧠 AES-256-GCM Decryptor (Web Crypto API)
 */
async function decrypt(token, secretHex) {
  // Convert base64url to Uint8Array
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/")
  const binString = atob(base64)
  const buffer = new Uint8Array(binString.length)
  for (let i = 0; i < binString.length; i++) {
    buffer[i] = binString.charCodeAt(i)
  }

  // Extract components (Match Node.js format: IV + TAG + DATA)
  const iv = buffer.slice(0, 12)
  const tag = buffer.slice(12, 28)
  const encryptedData = buffer.slice(28)

  // Combine data + tag for subtle.decrypt (it expects tag at the end)
  const combined = new Uint8Array(encryptedData.length + tag.length)
  combined.set(encryptedData)
  combined.set(tag, encryptedData.length)

  // Import Secret Key
  const keyBuffer = hexToBuffer(secretHex)
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    "AES-GCM",
    false,
    ["decrypt"]
  )

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128
    },
    cryptoKey,
    combined
  )

  return JSON.parse(new TextDecoder().decode(decrypted))
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}
