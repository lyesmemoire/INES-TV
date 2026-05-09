import React, { useEffect, useState } from "react";
import { getCDNStats } from "@/src/services/analyticsQueries";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

/**
 * 📊 CDN PERFORMANCE CHART
 * Visualizes average QoE scores per CDN.
 */
export default function CDNChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const events = await getCDNStats();
        const grouped: Record<string, any> = {};

        events.forEach((e) => {
          if (!e.cdn) return;

          if (!grouped[e.cdn]) {
            grouped[e.cdn] = { cdn: e.cdn, score: 0, count: 0 };
          }

          grouped[e.cdn].score += e.qoe_score || 0;
          grouped[e.cdn].count += 1;
        });

        const formatted = Object.values(grouped).map((g: any) => ({
          cdn: g.cdn,
          avgScore: g.count ? Math.round(g.score / g.count) : 0,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Failed to load CDN performance stats:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-white/5 border border-white/10 rounded-3xl animate-pulse">
        <span className="text-white/20 text-xs font-black uppercase tracking-widest">Analysing CDN load...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">CDN Performance Metrics</h3>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
                dataKey="cdn" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
            />
            <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
            />
            <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '12px'
                }}
            />
            <Bar dataKey="avgScore" radius={[8, 8, 0, 0]} barSize={40}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
