"use client";

import Link from "next/link";

interface Props {
  lostRevenue: number;
  count: number;
  type: 'SOFT' | 'HARD';
}

/**
 * 💰 REVENUE LOSS WARNING
 * Psychological trigger to drive conversion by showing missed opportunities.
 */
export default function RevenueLossWarning({ lostRevenue, count, type }: Props) {
  if (count === 0 && type === 'SOFT') return null;

  return (
    <div className={`mb-8 p-6 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-700 ${
      type === 'HARD' 
      ? 'bg-rose-50 border-rose-200 text-rose-900' 
      : 'bg-amber-50 border-amber-200 text-amber-900'
    }`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
            type === 'HARD' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {type === 'HARD' ? '🚫' : '⚠️'}
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight leading-none mb-1">
              {type === 'HARD' ? 'Monetization Analysis' : "Inventory Yield Insight"}
            </h3>
            <p className={`text-sm font-medium ${type === 'HARD' ? 'text-rose-600' : 'text-amber-700'}`}>
              {type === 'HARD' 
                ? `Subscription quota exceeded. Historical RPM suggests a potential loss of $${lostRevenue.toFixed(2)} based on current traffic.` 
                : `Active inventory has reached 80% of free-tier capacity. Consider upgrading to maintain 100% Revenue Efficiency.`}
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-6">
            <div className="text-right hidden sm:block">
                <div className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Lost Revenue Today</div>
                <div className="text-3xl font-black tracking-tighter leading-none">${lostRevenue.toFixed(2)}</div>
            </div>
            <Link 
              href="/pricing" 
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                type === 'HARD' 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20' 
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
              }`}
            >
              Unlock Revenue
            </Link>
        </div>
      </div>
    </div>
  );
}
