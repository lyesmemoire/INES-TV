"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  subValue?: string;
  alert?: boolean;
}

/**
 * 📊 SAAS STAT CARD
 * Industrial grade metric display with Emerald/Red logic.
 */
export default function StatCard({ 
  label, 
  value, 
  trend, 
  trendType = "neutral", 
  icon: Icon,
  subValue,
  alert = false
}: StatCardProps) {
  return (
    <div className={`
      relative bg-[#0F111A] border rounded-[28px] p-6 overflow-hidden transition-all duration-500
      ${alert ? "border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.05)]" : "border-white/5 hover:border-white/10"}
    `}>
      {/* BACKGROUND DECOR */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-10 ${alert ? "bg-red-500" : "bg-indigo-500"}`} />

      <div className="flex justify-between items-start relative z-10">
        <div>
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">{label}</p>
           <h3 className={`text-3xl font-black tracking-tight ${alert ? "text-red-400" : "text-white"}`}>{value}</h3>
           {subValue && <p className="text-[9px] font-bold text-zinc-600 mt-1 uppercase tracking-widest">{subValue}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${alert ? "bg-red-500/10 text-red-500" : "bg-white/5 text-zinc-400"}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-6 flex items-center gap-2 relative z-10">
           <span className={`
             text-[10px] font-black px-2 py-0.5 rounded-lg
             ${trendType === "up" ? "bg-emerald-500/10 text-emerald-500" : 
               trendType === "down" ? "bg-red-500/10 text-red-500" : 
               "bg-white/5 text-zinc-500"}
           `}>
             {trend}
           </span>
           <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest">Since last sync</span>
        </div>
      )}
    </div>
  );
}

/**
 * ✨ ADMIN GLOW ACCENT
 */
export function AdminGlow({ color = "indigo" }: { color?: "indigo" | "emerald" | "red" }) {
  const colors = {
    indigo: "bg-[#6366F1]",
    emerald: "bg-[#10B981]",
    red: "bg-[#EF4444]"
  };

  return (
    <div className={`absolute top-0 right-0 w-[600px] h-[600px] ${colors[color]} opacity-[0.03] blur-[150px] pointer-events-none select-none z-0`} />
  );
}
