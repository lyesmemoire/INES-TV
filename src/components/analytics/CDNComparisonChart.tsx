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
 * 📊 CDN COMPARISON CHART
 * Compares average QoE scores across different CDNs.
 * Lower scores = better performance.
 */
export default function CDNComparisonChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await getCDNStats();
        
        // Group by CDN and calculate average QoE
        const grouped = stats.reduce((acc: any, curr) => {
          if (!curr.cdn || curr.qoe_score === undefined) return acc;
          if (!acc[curr.cdn]) acc[curr.cdn] = { name: curr.cdn, total: 0, count: 0 };
          acc[curr.cdn].total += curr.qoe_score;
          acc[curr.cdn].count += 1;
          return acc;
        }, {});

        const processed = Object.values(grouped).map((item: any) => ({
          name: item.name,
          avgScore: Math.round(item.total / item.count),
        })).sort((a, b) => a.avgScore - b.avgScore); // Show best (lowest) first

        setData(processed);
      } catch (err) {
        console.error("Failed to load CDN stats:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-white/5 border border-white/10 rounded-3xl animate-pulse">
        <span className="text-white/20 text-xs font-black uppercase tracking-widest">Analysing CDNs...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-white tracking-tight uppercase tracking-widest text-[10px] opacity-70">CDN Performance (Avg QoE)</h3>
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lower is Better</span>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12} 
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
            <Bar dataKey="avgScore" radius={[0, 8, 8, 0]} barSize={32}>
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
