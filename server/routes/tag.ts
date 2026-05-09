import { Router, Request, Response } from "express";

const router = Router();

router.get("/tag.js", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/javascript");

  res.send(`
(function () {
  const pid = window.__INES TV_PID__;
  if (!pid) return;

  const run = async () => {
    // 🛡️ ANTI-CLS: Scanning for pre-defined slots to reserve space early
    const potentialSlots = document.querySelectorAll('[data-sp-format]');
    potentialSlots.forEach(el => {
      const format = el.getAttribute('data-sp-format');
      const formats = { "300x250": { h: 250, w: 300 }, "728x90": { h: 90, w: 728 }, "320x50": { h: 50, w: 320 } };
      const f = formats[format] || { h: 100, w: '100%' };
      el.style.minHeight = f.h + "px";
      el.style.width = (typeof f.w === 'number' ? f.w + "px" : f.w);
      el.style.display = "block";
    });

    let data;
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 1500);

      const res = await fetch(\`/api/ads/multi/\${pid}\`, { signal: controller.signal });
      data = await res.json();
    } catch (e) {
      console.warn("💎 [AdX] Multi-Auction failed/timed out, using fallbacks", e);
      // Fallback logic will be triggered by injectSlot if no data
    }

    if (!Array.isArray(data)) return;
    for (let i = 0; i < data.length; i++) {
        injectSlot(data[i]);
    }
  };

  function injectSlot(slot) {
    let el;

    try {
      el = document.querySelector(slot.selector);
    } catch {
      return;
    }

    if (!el) return;

    if (slot.lazy) {
      observe(el, slot);
    } else {
      render(el, slot);
    }
  }

  function observe(el, slot) {
    if (!window.IntersectionObserver) {
      render(el, slot);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        render(el, slot);
        io.disconnect();
      }
    });

    io.observe(el);
  }

  function render(el, slot) {
    const ad = slot.ad;

    // 🛡️ 4-TIER DEMAND CASCADE
    if (ad && !ad.isFallback) {
      // TIER 1 & 2: Targeted Campaigns
      el.innerHTML = buildCreative(slot, ad);
      if (ad.impressionUrl) new Image().src = ad.impressionUrl;
    } else {
      // TIER 3 & 4: House Ad -> External Demand
      renderFallback(el, slot);
    }
  }

  function renderFallback(el, slot) {
    const formats = {
      "300x250": { h: 250, w: 300 },
      "728x90": { h: 90, w: 728 },
      "320x50": { h: 50, w: 320 }
    };
    const f = formats[slot.format] || { h: 100, w: '100%' };

    // TIER 3: Reserved House Ad (Anti-CLS + Branding)
    el.style.minHeight = f.h + "px";
    el.style.width = (typeof f.w === 'number' ? f.w + "px" : f.w);

    const houseAd = \`
      <div style="width:100%; height:\${f.h}px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-center; text-align:center; font-family:sans-serif; overflow:hidden;">
        <div style="margin:auto;">
          <div style="font-weight:900; color:#cbd5e1; font-size:10px; letter-spacing:1px; margin-bottom:4px;">ADVERTISEMENT</div>
          <div style="font-weight:900; color:#3b82f6; font-size:12px;">INES TV <span style="color:#94a3b8">AdX</span></div>
        </div>
      </div>
    \`;

    el.innerHTML = houseAd;

    // TIER 4: External Network Fallback (Optional / Async)
    // In production, you would trigger your Adsterra / PropellerAds fallback here
    setTimeout(() => {
        if (!el.getAttribute('data-ad-filled')) {
            loadExternalDemand(el, slot);
        }
    }, 500);
  }

  function loadExternalDemand(el, slot) {
    console.log("💰 [AdX] Triggering Tier-4 Fallback Demand");
    // Placeholder for 3rd Party Script Injection
    // Example: (adsbygoogle = window.adsbygoogle || []).push({});
  }

  function buildCreative(slot, ad) {
    const clickUrl = "/click?url=" + encodeURIComponent(ad.url || "https://inestv.dz");
    
    let style = "width:100%; height:auto; display:block; border-radius:8px;";
    if (slot.format === "728x90") style = "width:728px; height:90px; border:none;";
    if (slot.format === "300x250") style = "width:300px; height:250px; border:none;";

    return \`
      <div style="position:relative; overflow:hidden; min-height:\${style.match(/height:(\\d+)px/)?.[1] || 0}px" data-ad-filled="true">
        <a href="\${clickUrl}" target="_blank" style="text-decoration:none; display:block;">
          <img src="\${ad.creativeUrl || 'https://via.placeholder.com/' + slot.format}" style="\${style}" />
        </a>
      </div>
    \`;
  }

  window.addEventListener('error', (e) => {
    if (e.message && e.message.includes('INES TV')) console.warn('💎 [AdX] Suppressed error:', e.message);
  });

  (window.requestIdleCallback || setTimeout)(run, 1);
})();
  `);
});

export default router;
