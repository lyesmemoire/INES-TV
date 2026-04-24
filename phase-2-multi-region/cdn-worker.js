export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const token = url.searchParams.get("token");
      const exp = url.searchParams.get("exp");

      // 1. GEO BLOCKING (LEAN)
      const country = request.headers.get("CF-IPCountry") || "FR";
      if (!["FR", "DZ"].includes(country)) {
        return new Response("Geo Blocked", { status: 403 });
      }

      // 2. TOKEN & EXPIRATION CHECK
      if (!token || !exp) {
        return new Response("Forbidden", { status: 403 });
      }

      if (Date.now() > Number(exp)) {
        return new Response("Forbidden", { status: 403 });
      }

      // 3. FETCH ORIGIN
      let response = await fetch(request);

      // 4. HMAC SUR SEGMENTS (.ts) - REWRITE MANIFEST
      if (url.pathname.endsWith(".m3u8") && response.ok) {
        let manifest = await response.text();
        manifest = manifest.replace(
          /(.+\.ts)/g,
          `$1?token=${token}&exp=${exp}`
        );
        return new Response(manifest, response);
      }

      return response;
    } catch (globalErr) {
      console.error("[Edge] Global Exception. Failsafe: ALLOW.");
      return fetch(request);
    }
  },
};
