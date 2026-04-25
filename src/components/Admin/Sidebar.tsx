"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Tv2, 
  Settings, 
  ShieldAlert, 
  Activity, 
  LayoutDashboard,
  Layers
} from "lucide-react";

/**
 * 🧭 SAAS ADMIN SIDEBAR (Pro Edition)
 * Optimized for Noir OS branding.
 */
export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", icon: LayoutDashboard, href: "/admin" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "AdX Studio", icon: BarChart3, href: "/admin/ads" },
    { name: "Stream Orch", icon: Tv2, href: "/admin/streams" },
    { name: "Analytics", icon: Layers, href: "/admin/analytics" },
    { name: "Security", icon: ShieldAlert, href: "/admin/security" },
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className="w-64 h-full bg-[#0B0F19] border-r border-white/5 flex flex-col relative z-20">
      {/* BRANDING HEADER */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-600/20">CTRL</div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter uppercase italic">Control<span className="text-indigo-500">Plane</span></span>
            <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-[0.3em]">StreamPerf Industrial</span>
          </div>
        </div>

        {/* 🏠 RETOUR AU SITE */}
        <Link href="/">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
            <LayoutDashboard size={16} />
            Retour au site
          </button>
        </Link>
      </div>

      {/* NAVIGATION SECTIONS */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all group
                ${isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"}
              `}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-600 group-hover:text-indigo-400"} transition-colors`} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* STATUS FOOTER */}
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-4">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">OS Kernel 1.0.4 Live</span>
        </div>
      </div>
    </div>
  );
}
