"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Plus, 
  CreditCard, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Activity,
  History,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Reseller {
  id: string;
  name: string;
  email: string;
  credits: number;
  userCount: number;
  totalWatchTime: number;
  createdAt: string;
}

export default function ResellersManagement() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResellers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch("/api/admin/resellers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResellers(data);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    fetchResellers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight">Resellers</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your OTT distribution network.</p>
          </div>

          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#6366F1] text-white rounded-lg font-bold text-sm hover:bg-[#4F46E5] transition-all shadow-xl shadow-indigo-500/20">
              <Plus size={18} /> New Partner
          </button>
      </header>

      {/* PRO B2B TABLE */}
      <div className="bg-[#111827] border border-gray-800/50 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-[#1F2937]/50">
                      <tr className="border-b border-gray-800/50">
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reseller</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Credits</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Users</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Watch Time</th>
                          <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                      {resellers.map((r) => (
                          <tr key={r.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-8 py-6">
                                  <span className="font-bold text-white">{r.name}</span>
                              </td>
                              <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                                  {r.email}
                              </td>
                              <td className="px-8 py-6 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                      r.credits > 10 ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                  }`}>
                                      {r.credits}
                                  </span>
                              </td>
                              <td className="px-8 py-6 text-center font-bold text-sm">
                                  {r.userCount}
                              </td>
                              <td className="px-8 py-6 text-right font-mono text-sm text-gray-400 underline decoration-indigo-500/30 underline-offset-4 decoration-dashed">
                                  {Math.round(r.totalWatchTime / 60)} min
                              </td>
                              <td className="px-8 py-6 text-right text-gray-700 group-hover:text-white transition-colors">
                                  <div className="flex items-center justify-end gap-2">
                                      <button className="p-2 hover:bg-gray-800 rounded-lg transition-all" title="Credits Management">
                                          <CreditCard size={18} className="text-gray-500 hover:text-indigo-500" />
                                      </button>
                                      <button className="p-2 hover:bg-gray-800 rounded-lg transition-all" title="Details">
                                          <ChevronRight size={18} className="text-gray-500" />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}
