"use client";
import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, AlertCircle, Play, Clock, MousePointer2, ExternalLink } from "lucide-react";

export default function AnalyticsDashboard() {
  const [adsData, setAdsData] = useState<any[]>([]);
  const [streamsData, setStreamsData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adsRes, streamsRes] = await Promise.all([
          fetch("/api/admin/dashboard/ads"),
          fetch("/api/admin/dashboard/streams")
        ]);

        if (!adsRes.ok || !streamsRes.ok) throw new Error("Unauthorized or server error");

        const ads = await adsRes.json();
        const streams = await streamsRes.json();
        setAdsData(ads);
        setStreamsData(streams);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="text-emerald-500 w-8 h-8" />
            Analytics Hub
          </h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-medium">Real-time performance metrics</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live Monitoring
        </div>
      </div>

      {/* Ads Performance */}
      <section className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <TrendingUp className="text-blue-500 w-5 h-5" />
          <h2 className="text-xl font-bold text-zinc-100">Electronic Ads (CTR)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Placement / ID</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Impressions</th>
                <th className="px-6 py-4">Clicks</th>
                <th className="px-6 py-4 text-right">CTR %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {adsData.length > 0 ? adsData.map((ad) => (
                <tr key={ad.adId} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-400 group-hover:text-emerald-500 transition-colors">{ad.adId}</td>
                  <td className="px-6 py-4">
                    <span className="bg-zinc-800 px-2.5 py-1 rounded-md text-[10px] font-bold text-zinc-300 uppercase tracking-tighter">
                      {ad.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-100">{ad.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-100">{ad.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-black ${ad.ctr > 2 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {ad.ctr.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-600 text-sm italic">No ad data collected yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Streaming Performance */}
      <section className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <Play className="text-emerald-500 w-5 h-5" />
          <h2 className="text-xl font-bold text-zinc-100">Live Stream Engagement</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Channel / ID</th>
                <th className="px-6 py-4">Total Plays</th>
                <th className="px-6 py-4">Health (Errors)</th>
                <th className="px-6 py-4 text-right">Avg. Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {Object.keys(streamsData).length > 0 ? Object.entries(streamsData).map(([channelId, stats]: any) => (
                <tr key={channelId} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    {channelId.split('/').pop()?.substring(0, 20)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-400">{stats.plays.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{ width: `${Math.min((stats.errors / (stats.plays || 1)) * 100, 100)}%` }} 
                        />
                      </div>
                      <span className="text-[10px] text-zinc-600 font-bold">{stats.errors} err</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-white">{(stats.watchTime / 60).toFixed(1)}m</span>
                      <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Total Usage</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-600 text-sm italic">Passive monitoring starting...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
