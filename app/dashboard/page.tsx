"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdTagCard from "@/components/AdTagCard";
import RevenueLossWarning from "@/components/RevenueLossWarning";

/**
 * 🏠 DASHBOARD HOME
 * The primary entry point for authenticated publishers.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [pid, setPid] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setPid(session.user.id);
  }

  async function fetchInsights() {
    if (!pid) return;
    try {
      const res = await fetch(`/api/analytics/insights/${pid}`);
      const data = await res.json();
      setInsights(data);
    } catch (e) {
      console.error("Failed to fetch insights", e);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (pid) {
      fetchInsights();
      const i = setInterval(fetchInsights, 5000);
      return () => clearInterval(i);
    }
  }, [pid]);

  if (!pid) return null;

  const totalBlocked = insights?.blocked?.total || 0;
  const imps = insights?.impressions || 0;
  const paywallType = totalBlocked > 0 ? 'HARD' : (imps > 8000 ? 'SOFT' : 'NONE');

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Publisher Console</h1>
        <p className="text-slate-500 mt-1">Manage your inventory, track revenue, and scale your audience monetization.</p>
      </div>

      {paywallType !== 'NONE' && (
        <RevenueLossWarning 
          lostRevenue={insights?.lostRevenue?.total || 0} 
          count={totalBlocked} 
          type={paywallType as any} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN DEPLOYMENT CARD */}
        <div className="lg:col-span-2 space-y-8">
          <AdTagCard pid={pid} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickLinkCard 
                title="Manage Placements" 
                desc="Create and configure your CSS-based ad slots." 
                href="/dashboard/slots" 
                icon="🎯"
            />
            <QuickLinkCard 
                title="Revenue Analytics" 
                desc="Real-time performance and RPM tracking." 
                href="/dashboard/analytics" 
                icon="📈"
            />
          </div>
        </div>

        {/* SIDEBAR / HELP */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <h3 className="text-xl font-bold mb-4 relative z-10">Integration Tip</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 relative z-10">
                    Always place the <code>tag.js</code> script as high as possible in your HTML <code>&lt;head&gt;</code> to ensure auctions begin immediately upon page load.
                </p>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold relative z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Ultra Kernel Active
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account Status</h4>
                <div className="space-y-4">
                    <StatusField label="Publisher ID" value={pid.substring(0, 8) + "..."} />
                    <StatusField label="Tier" value={insights?.plan === 2 ? "SCALE" : (insights?.plan === 1 ? "PRO" : "FREE")} />
                    <StatusField label="Fill Efficiency" value={`${insights?.efficiencyScore || 100}%`} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard({ title, desc, href, icon }) {
    return (
        <a href={href} className="flex flex-col p-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-500 hover:shadow-lg transition-all group">
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">{icon}</div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
        </a>
    );
}

function StatusField({ label, value }) {
    return (
        <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="text-slate-900 font-bold">{value}</span>
        </div>
    );
}
