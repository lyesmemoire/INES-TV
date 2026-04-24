import React, { useEffect, useState } from "react";
import { getQoEStats } from "@/services/analyticsQueries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/**
 * 📈 QoE CHART COMPONENT
 * Visualizes the trend of Quality of Experience scores over time.
 */
export default function QoEChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const events = await getQoEStats();

        // Map events that have a QoE score, using index as a proxy for time if created_at isn't used
        const mapped = events
          .filter((e) => e.qoe_score !== null && e.qoe_score !== undefined)
          .map((e, i) => ({
            index: i,
            score: e.qoe_score,
            time: e.created_at ? new Date(e.created_at).toLocaleTimeString() : i
          }));

        setData(mapped);
      } catch (err) {
        console.error("Failed to load QoE stats:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-white/5 border border-white/10 rounded-3xl animate-pulse">
        <span className="text-white/20 text-xs font-black uppercase tracking-widest">Loading metrics...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-white tracking-tight uppercase tracking-widest text-[10px] opacity-70">QoE Score Trend</h3>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-time</span>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
                dataKey="time" 
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
                contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                }}
                itemStyle={{ color: '#10b981' }}
            />
            <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
