import React, { useEffect, useState } from "react";
import { getChannelStats } from "@/src/services/analyticsQueries";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

/**
 * 📺 CHANNEL HEALTH CHART
 * Visualizes error rates and average QoE scores per channel.
 */
export default function ChannelChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const events = await getChannelStats();
        const grouped: Record<string, any> = {};

        events.forEach((e) => {
          if (!e.channel_id) return;

          if (!grouped[e.channel_id]) {
            grouped[e.channel_id] = {
              channel: e.channel_id,
              errors: 0,
              score: 0,
              count: 0,
            };
          }

          if (e.event_type === "error") {
            grouped[e.channel_id].errors++;
          }

          if (e.qoe_score !== undefined && e.qoe_score !== null) {
            grouped[e.channel_id].score += e.qoe_score;
          }
          grouped[e.channel_id].count++;
        });

        const formatted = Object.values(grouped).map((g: any) => ({
          channel: g.channel,
          errorRate: g.errors,
          avgQoE: g.count ? Math.round(g.score / g.count) : 0,
        }));

        setData(formatted);
      } catch (err) {
        console.error("Failed to load channel health stats:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-white/5 border border-white/10 rounded-3xl animate-pulse">
        <span className="text-white/20 text-xs font-black uppercase tracking-widest">Scanning channels...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Channel Health & Stability</h3>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Errors</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Avg QoE</span>
            </div>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
                dataKey="channel" 
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
            <Bar dataKey="errorRate" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="avgQoE" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
