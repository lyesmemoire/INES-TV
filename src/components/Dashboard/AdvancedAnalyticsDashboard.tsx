"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AlertCircle, TrendingUp, BarChart, Bell, Zap, ShieldAlert } from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdvancedAnalyticsDashboard() {
  const [adsData, setAdsData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/ads");
        const data = await res.json();
        setAdsData(data.report || []);
        setAlerts(data.alerts || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: adsData.map(a => a.platform.toUpperCase() + " (" + a.adId.substring(0, 4) + ")"),
    datasets: [
      {
        label: "Weight (Diffusion)",
        data: adsData.map(a => a.weight),
        backgroundColor: "rgba(16, 185, 129, 0.6)", // Emerald
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "CTR % (Engagement)",
        data: adsData.map(a => a.ctr),
        backgroundColor: "rgba(59, 130, 246, 0.6)", // Blue
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#71717a", font: { weight: 'bold' as const } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#71717a" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#71717a" },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-zinc-800 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Zap className="text-emerald-500 w-8 h-8" />
            Advanced Ad Intel
          </h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-medium italic">Powered by AI Ads Optimizer</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800 text-right">
             <div className="text-[10px] text-zinc-500 uppercase font-black">Active Ads</div>
             <div className="text-xl font-bold text-white">{adsData.length}</div>
          </div>
        </div>
      </div>

      {/* 🚨 Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-500">
            <ShieldAlert className="w-6 h-6" />
            <h3 className="font-black uppercase tracking-widest text-sm">Performance Anomalies</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map(a => (
              <div key={a.adId} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-red-400/70 uppercase font-bold tracking-tighter">Ad ID: {a.adId}</div>
                  <div className="text-sm font-bold text-red-200">{a.platform.toUpperCase()} Performance</div>
                </div>
                <div className="text-right">
                   <div className="text-xl font-black text-red-500">{a.ctr.toFixed(1)}%</div>
                   <div className="text-[10px] text-red-400 uppercase font-medium">{a.ctr < 1 ? 'Underperforming' : 'Suspicious high'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Section */}
        <div className="lg:col-span-2 bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-blue-500 w-5 h-5" />
              <h2 className="text-xl font-bold text-zinc-100">Weighted Performance</h2>
            </div>
            <div className="text-[10px] text-zinc-500 uppercase font-black">Live Data Stream</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-900/50 text-zinc-500 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-6 py-4">Ad Platform</th>
                  <th className="px-6 py-4">Current Weight</th>
                  <th className="px-6 py-4">CTR %</th>
                  <th className="px-6 py-4 text-right">Yield (Impressions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {adsData.length > 0 ? adsData.map((ad) => (
                  <tr key={ad.adId} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white uppercase tracking-tighter">{ad.platform}</span>
                        <span className="text-[10px] text-zinc-600 font-mono italic">ID: {ad.adId.substring(0,8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${ad.weight}%` }} />
                         </div>
                         <span className="text-xs font-bold text-zinc-400">{ad.weight}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${ad.ctr > 5 ? 'text-emerald-400' : ad.ctr < 1 ? 'text-red-500' : 'text-blue-400'}`}>
                        {ad.ctr.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-zinc-300">
                      {ad.impressions.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-600">No active ads detected for analysis.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 flex flex-col shadow-2xl h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <BarChart className="text-zinc-500 w-5 h-5" />
            <h2 className="text-xl font-bold text-zinc-100">Yield Comparison</h2>
          </div>
          <div className="flex-1 min-h-0">
             <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
