"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/**
 * 🎯 AD SLOTS MANAGEMENT DASHBOARD
 * Multi-Tenancy Enabled via Supabase Auth.
 */
export default function SlotsPage() {
  const router = useRouter();
  const [pid, setPid] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [form, setForm] = useState({
    selector: "",
    format: "300x250",
    lazy: false
  });
  const [loading, setLoading] = useState(true);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setPid(session.user.id);
  }

  async function load() {
    if (!pid) return;
    try {
      const res = await fetch(`/api/slots/${pid}`);
      const data = await res.json();
      setSlots(data);
    } catch (e) {
      console.error("Failed to load slots", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!pid) return;
    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, [pid]);

  async function createSlot() {
    if (!pid || !form.selector) return;

    await fetch(`/api/slots/${pid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Date.now().toString(),
        ...form
      })
    });

    setForm({ selector: "", format: "300x250", lazy: false });
    load();
  }

  async function toggle(id: string) {
    if (!pid) return;
    await fetch(`/api/slots/${pid}/${id}`, {
      method: "PATCH"
    });
    load();
  }

  async function remove(id: string) {
    if (!pid || !confirm("Are you sure?")) return;
    await fetch(`/api/slots/${pid}/${id}`, {
      method: "DELETE"
    });
    load();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ad Slots Manager</h1>
          <p className="text-slate-500 mt-1">Control your ad placements dynamically across your web properties.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium border border-emerald-100">
          ● Platform Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CREATE SLOT PANEL */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">New Placement</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">CSS Selector</label>
                <input
                  placeholder="#header-ad or .sidebar-middle"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700"
                  value={form.selector}
                  onChange={(e) => setForm({ ...form, selector: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ad Format</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-700 appearance-none"
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                >
                  <option value="300x250">Medium Rectangle (300x250)</option>
                  <option value="728x90">Leaderboard (728x90)</option>
                  <option value="mobile-flex">Mobile Flexible</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="group flex items-center gap-3 cursor-pointer select-none">
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${form.lazy ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${form.lazy ? 'translate-x-5' : ''}`} />
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.lazy}
                    onChange={(e) => setForm({ ...form, lazy: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-600">Enable Lazy Load</span>
                </label>
              </div>

              <button
                onClick={createSlot}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md active:scale-95 mt-4"
              >
                Create Placement
              </button>
            </div>
          </div>
        </div>

        {/* SLOTS LIST */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Placement Selector</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slots.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No ad placements configured yet.
                    </td>
                  </tr>
                )}
                {slots.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <code className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{s.selector}</code>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">{s.format}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        {s.active ? "LIVE" : "PAUSED"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-4">
                      <button
                        onClick={() => toggle(s.id)}
                        className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {s.active ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => remove(s.id)}
                        className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white overflow-hidden relative shadow-xl">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Integration Guide</h3>
          <p className="text-slate-400 text-sm max-w-2xl mb-6">
            Simply add your Publisher ID to your site's header and place your CSS selectors where you want the magic to happen.
          </p>
          <div className="bg-black/40 p-4 rounded-xl font-mono text-xs text-blue-300 border border-white/5 backdrop-blur-sm">
            &lt;script&gt;window.__STREAMPERF_PID__ = "{pid ?? 'YOUR_PID_HERE'}";&lt;/script&gt;<br />
            &lt;script src="/tag.js" async&gt;&lt;/script&gt;
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
      </div>
    </div>
  );
}
