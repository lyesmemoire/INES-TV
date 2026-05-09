"use client";

import { useState } from "react";

export default function AdTagCard({ pid }: { pid: string }) {
  const [copied, setCopied] = useState(false);

  const tagScript = `<script async src="https://inestv.com/tag.js?pid=${pid}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(tagScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Your Ad Tag</h3>
          <p className="text-slate-500 text-sm mt-1">
            Place this snippet in your website&apos;s <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">&lt;head&gt;</code>
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            copied
              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {copied ? "✓ Copied" : "Copy Tag"}
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl p-5 overflow-x-auto">
        <code className="text-emerald-400 text-sm font-mono whitespace-pre">{tagScript}</code>
      </div>
    </div>
  );
}
