"use client";

import { useState } from "react";

/**
 * 🏷️ AD TAG CARD
 * The bridge between the platform and the publisher's site.
 * Personalized with the Publisher ID (PID).
 */
export default function AdTagCard({ pid }: { pid: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const tag = `<!-- StreamPerf AdX Tag (Anti-CLS Ready) -->
<div class="sp-ad-slot" data-sp-format="300x250"></div>
<script>
  window.__STREAMPERF_PID__ = "${pid}";
</script>
<script src="${baseUrl}/tag.js" async></script>`;

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(tag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Ad Tag</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Ready for deployment. No approval required.</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-blue-100">
            Multi-Tenant Ready
          </div>
        </div>

        <div className="relative group">
          <pre className="bg-slate-900 text-blue-300 p-6 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
            {tag}
          </pre>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
             <span className="text-[10px] font-bold text-slate-500 bg-slate-950/50 px-2 py-1 rounded">HTML</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={copyToClipboard}
            className={`flex-1 font-black py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
              copied 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
              : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-900/10'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                Copied to Clipboard
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                Copy Ad Tag
              </>
            )}
          </button>

          <a
            href="/"
            target="_blank"
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 font-black py-4 rounded-xl hover:bg-slate-100 transition-all text-center active:scale-95"
          >
            Preview on Site
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Works Instantly
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Auto-Scaling Enabled
            </div>
        </div>
      </div>
    </div>
  );
}
