"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Trash2, 
  ShieldCheck, 
  UserPlus, 
  Search,
  Filter
} from "lucide-react";

/**
 * 👤 USER MANAGEMENT PAGE
 * Professional SaaS interface for Free/Premium segmentation.
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/saas/users", {
          headers: { "x-admin-secret": "staff_emerge_key" }
        });
        const data = await res.json();
        setUsers(data);
      } catch (e) {
        console.error("Users fetch failed");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleSetPlan = async (userId: string, plan: string) => {
     await fetch("/api/admin/saas/users/plan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-secret": "staff_emerge_key"
        },
        body: JSON.stringify({ userId, plan })
     });
     // Refresh list
     setUsers(users.map(u => u.id === userId ? { ...u, plan, isPremium: plan !== "FREE" } : u));
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black tracking-tighter text-white">Identity <span className="text-zinc-700">Hub</span></h2>
           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Segmentation & Role Management</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
              <input 
                placeholder="Find users..." 
                className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-white w-64 focus:border-indigo-500 outline-none transition"
              />
           </div>
           <button className="bg-white/5 border border-white/10 p-3 rounded-2xl text-zinc-500 hover:text-white transition">
              <Filter size={18} />
           </button>
        </div>
      </div>

      {/* TABS (Simplified) */}
      <div className="flex gap-6 border-b border-white/5">
         {["ALL PEERS", "PREMIUM", "PRO", "BANNED"].map(tab => (
           <button key={tab} className={`pb-4 text-[10px] font-black uppercase tracking-widest ${tab === "ALL PEERS" ? "text-indigo-500 border-b-2 border-indigo-500" : "text-zinc-600 hover:text-zinc-400"}`}>
             {tab}
           </button>
         ))}
      </div>

      {/* USERS TABLE */}
      <div className="bg-[#0F111A] border border-white/5 rounded-[40px] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Identity</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Tier / Zone</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">Compliance</th>
              <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="h-16 bg-white/[0.01]" />
                </tr>
              ))
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center font-black text-xs text-indigo-500">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <p className="text-[11px] font-black text-white">{user.name || "Anonymous"}</p>
                         <p className="text-[9px] font-bold text-zinc-600 tracking-tight">{user.email}</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className={`
                      inline-flex items-center gap-2 px-3 py-1 rounded-full border
                      ${user.plan === "PRO" ? "bg-purple-500/10 border-purple-500/30 text-purple-500" : 
                        user.plan === "PREMIUM" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" : 
                        "bg-white/5 border-white/10 text-zinc-500"}
                   `}>
                      <span className="text-[8px] font-black uppercase tracking-widest">{user.plan}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.isBanned ? "bg-red-500" : "bg-emerald-500"}`} />
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                        {user.isBanned ? "Restricted" : "Good Standing"}
                      </span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleSetPlan(user.id, user.plan === "PRO" ? "FREE" : "PRO")}
                        className="p-2.5 bg-indigo-600/10 text-indigo-500 rounded-xl hover:bg-indigo-600 hover:text-white transition"
                        title="Change Plan"
                      >
                         <UserPlus size={14} />
                      </button>
                      <button className="p-2.5 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition" title="Restrict Access">
                         <ShieldCheck size={14} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
