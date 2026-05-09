"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("🚨 [FRONTEND_CRASH]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full border border-red-500/50 bg-red-500/10 p-8 rounded-[32px] text-center">
        <h2 className="text-2xl font-black text-red-500 mb-4 uppercase tracking-tighter">System Error Detected</h2>
        <p className="text-zinc-400 text-sm mb-8">
          The Attention OS encountered a critical runtime exception. This might be due to a synchronization delay in the Edge Mesh.
        </p>
        <div className="space-y-4">
            <button
                onClick={() => reset()}
                className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition"
            >
                Attempt Recovery
            </button>
            <button
                onClick={() => window.location.reload()}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-zinc-800 transition"
            >
                Hard Reload
            </button>
        </div>
      </div>
      <p className="mt-10 text-[8px] text-zinc-800 uppercase tracking-[0.5em]">INES TV Industrial Media Layer • Error Handler Active</p>
    </div>
  );
}
