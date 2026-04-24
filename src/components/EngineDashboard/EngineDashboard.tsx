import { useState, useEffect, useMemo, useRef } from "react";
import { sections, limits, upgrades } from "./data/content";
import SectionCard from "./components/SectionCard";
import Sidebar from "./components/Sidebar";
import StatsBar from "./components/StatsBar";
import ArchDiagram from "./components/ArchDiagram";
import FeasibilityPage from "./components/FeasibilityPage";

type Tab = "engine" | "feasibility";

export default function EngineDashboard() {
  const [tab, setTab] = useState<Tab>("engine");
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  const observerRef = useRef<IntersectionObserver | null>(null);

  const memoSections = useMemo(() => sections, []);

  useEffect(() => {
    if (tab !== "engine") return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0.1,
      }
    );

    const elements: HTMLElement[] = [];

    memoSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) {
        observerRef.current?.observe(el);
        elements.push(el);
      }
    });

    return () => {
      elements.forEach((el) => {
        observerRef.current?.unobserve(el);
      });
      observerRef.current?.disconnect();
    };
  }, [tab, memoSections]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1 py-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-4 hidden sm:block">
            Stream Engine
          </span>

          {[
            { id: "engine", label: "🔧 Load Balancer Engine" },
            { id: "feasibility", label: "🔒 Masquer User ↔ Source" },
          ].map((t) => (
            <button
               key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ENGINE TAB */}
      {tab === "engine" && (
        <>
          <header className="max-w-6xl mx-auto px-6 py-14">
            <h1 className="text-4xl font-black text-white mb-4">
              Stream Load Balancer Engine
            </h1>

            <p className="text-slate-400 mb-6">
              1000+ users distribués intelligemment sur plusieurs CDN.
            </p>

            <StatsBar />
          </header>

          <section className="max-w-6xl mx-auto px-6 py-12">
            <ArchDiagram />
          </section>

          <main className="max-w-6xl mx-auto px-6 pb-16">
            <div className="flex gap-10">
              
              <Sidebar sections={memoSections} activeId={activeId} />

              <div className="flex-1 space-y-6">
                {memoSections.map((s, i) => (
                  <SectionCard key={s.id} section={s} index={i} />
                ))}

                {/* LIMITS */}
                <div className="p-6 border border-red-500/20 rounded-xl">
                  <h3 className="text-red-400 font-bold mb-4">🚨 Limites</h3>
                  {limits.map((l, i) => (
                    <p key={i} className="text-sm text-slate-400">
                      {l.label} — {l.detail}
                    </p>
                  ))}
                </div>

                {/* UPGRADES */}
                <div className="p-6 border border-emerald-500/20 rounded-xl">
                  <h3 className="text-emerald-400 font-bold mb-4">🚀 Upgrades</h3>
                  {upgrades.map((u, i) => (
                    <p key={i} className="text-sm text-slate-400">
                      {u.label} — {u.detail}
                    </p>
                  ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-10">
                  <button
                    onClick={() => setTab("feasibility")}
                    className="px-6 py-3 bg-emerald-600 rounded-xl text-white font-bold hover:bg-emerald-500 transition-colors"
                  >
                    🔒 Voir Faisabilité
                  </button>
                </div>

              </div>
            </div>
          </main>
        </>
      )}

      {/* FEASIBILITY */}
      {tab === "feasibility" && <FeasibilityPage />}

      <footer className="text-center text-xs text-slate-600 py-6 border-t border-slate-800 mt-12">
        Stream Engine — Lean MVP Infrastructure
      </footer>
    </div>
  );
}
