import { ReactNode } from "react";
import AdminSidebar from "@/src/components/Admin/Sidebar";
import { AdminGlow } from "@/src/components/Admin/StatCard";
import "@/app/globals.css";

/**
 * 🏰 UNIFIED SAAS ADMIN LAYOUT
 * Professional Noir OS wrapper for all admin-level orchestration.
 */
export const metadata = {
  title: "Admin Control Plane - StreamPerf OS",
  description: "B2B SaaS Orchestration Engine",
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-[#020202] text-zinc-100 overflow-hidden font-sans">
      {/* SIDEBAR NAVIGATION */}
      <AdminSidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative bg-[#060606]">
        {/* Aesthetic Accents */}
        <AdminGlow color="indigo" />
        
        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* GLOBAL PULSE (System Health) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full">
         <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
         <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Kernel Sync Active</span>
      </div>
    </div>
  );
}
