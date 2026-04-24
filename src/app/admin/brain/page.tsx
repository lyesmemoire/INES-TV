"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  ShieldAlert, 
  Filter, 
  Search, 
  BarChart3, 
  Terminal, 
  Cpu, 
  AlertTriangle 
} from 'lucide-react';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { createClient } from '@supabase/supabase-js';

// --- CONFIG ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---
type SystemState = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
type EngineType = 'ALL' | 'SPORTS' | 'MOMENTUM' | 'PREDICTIVE' | 'SYSTEM' | 'ERRORS';

// --- COMPONENTS ---

export default function BrainDashboard() {
  const [view, setView] = useState<'STREAM' | 'DASHBOARD' | 'SECURITY'>('STREAM');
  const [filter, setFilter] = useState<EngineType>('ALL');
  const [intensity, setIntensity] = useState<number>(0); // 0: All, 1: Medium+, 2: High+
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    queueSize: 0,
    avgLatency: 0,
    errorRate: 0,
    systemMode: 'STABLE'
  });
  const [systemState, setSystemState] = useState<SystemState>('HEALTHY');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [anomalyStream, setAnomalyStream] = useState<any[]>([]);
  const [healthSnapshots, setHealthSnapshots] = useState<any[]>([]);


  // 1. SUPABASE REALTIME
  useEffect(() => {
    // Stats polling
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        queueSize: Math.floor(Math.random() * 50),
        avgLatency: Math.floor(Math.random() * 100) + 20,
        errorRate: parseFloat((Math.random() * 2).toFixed(2)),
      }));
    }, 5000);

    // 3. AI ANOMALY STREAM (v17)
    const anomalyChannel = supabase
      .channel('anomaly-intelligence')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'AIAnomalyScore' }, (payload) => {
          setAnomalyStream(prev => [payload.new, ...prev].slice(0, 50));
      })
      .subscribe();

    // 4. SYSTEM HEALTH SNAPSHOTS
    const healthChannel = supabase
      .channel('system-health')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'SystemHealthSnapshot' }, (payload) => {
          setHealthSnapshots(prev => [payload.new, ...prev].slice(0, 30));
          setSystemState(payload.new.status as SystemState);
      })
      .subscribe();

    // Dummy channel placeholder (for removeChannel cleanup)
    const channel = supabase.channel('brain-events').subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(anomalyChannel);
      supabase.removeChannel(healthChannel);
      clearInterval(interval);
    };
  }, []);


  // 3. FILTERING LOGIC (Signal Lens)
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchEngine = filter === 'ALL' || e.engine_type === filter;
      const matchIntensity = (e.priority_score || 2) <= (4 - intensity);
      
      // Auto-filter in CRITICAL mode
      if (systemState === 'CRITICAL') {
        return e.engine_type === 'SPORTS' || (e.priority_score || 2) === 1;
      }
      
      return matchEngine && matchIntensity;
    });
  }, [events, filter, intensity, systemState]);

  return (
    <div className={`min-h-screen bg-black text-white p-6 transition-all duration-700 ${
      systemState === 'CRITICAL' ? 'border-4 border-red-600/50 shadow-[0_0_50px_rgba(220,38,38,0.2)]' : 
      systemState === 'DEGRADED' ? 'border-4 border-amber-500/30' : 'border-4 border-cyan-500/10'
    }`}>
      
      {/* --- HEADER STATE --- */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cpu className={systemState === 'HEALTHY' ? 'text-cyan-400' : 'text-red-500 animate-pulse'} />
            Brain Control Tower
            <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400 font-mono">v15.2-HYBRID</span>
          </h1>
          <p className="text-gray-500 mt-1">Real-time perception-action orchestration monitoring</p>
        </div>

        <div className="flex gap-4">
          <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
            <button 
              onClick={() => setView('STREAM')}
              className={`px-4 py-2 rounded-md transition ${view === 'STREAM' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}
            >
              LIVE STREAM
            </button>
            <button 
              onClick={() => setView('DASHBOARD')}
              className={`px-4 py-2 rounded-md transition ${view === 'DASHBOARD' ? 'bg-cyan-600 text-white' : 'text-gray-400'}`}
            >
              DASHBOARD
            </button>
            <button 
              onClick={() => setView('SECURITY')}
              className={`px-4 py-2 rounded-md transition ${view === 'SECURITY' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
            >
              SECURITY
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <section className="h-full">
          {view === 'DASHBOARD' ? (
            <div className="p-8 h-full space-y-8 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 gap-6">
                  {/* Latency Waveform */}
                  <div className="bg-black/50 p-6 rounded-2xl border border-gray-800">
                     <h4 className="text-gray-400 text-[10px] mb-4 uppercase flex items-center gap-2">
                        <Activity size={12} className="text-cyan-400" /> System Latency Waveform
                     </h4>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthSnapshots.slice().reverse()}>
                            <Line type="monotone" dataKey="avgLatencyMs" stroke="#22d3ee" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                            <RechartsTooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                          </LineChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Abuse Rate Heatmap Logic */}
                  <div className="bg-black/50 p-6 rounded-2xl border border-gray-800">
                     <h4 className="text-gray-400 text-[10px] mb-4 uppercase flex items-center gap-2">
                        <ShieldAlert size={12} className="text-red-400" /> Global Abuse Pressure
                     </h4>
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthSnapshots.slice().reverse()}>
                            <Line type="stepAfter" dataKey="abuseRate" stroke="#ef4444" strokeWidth={3} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>

               {/* Autonomous Status Bar */}
               <div className="flex gap-4">
                  {['QUEUED', 'PROCESSED', 'AUTONOMOUS_ACTIONS'].map(metric => (
                    <div key={metric} className="flex-1 bg-gray-900/40 p-4 rounded-xl border border-gray-800">
                      <div className="text-[10px] text-gray-500 uppercase">{metric}</div>
                      <div className="text-2xl font-bold font-mono">
                        {metric === 'AUTONOMOUS_ACTIONS' ? anomalyStream.length : (Math.random() * 1000).toFixed(0)}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          ) : view === 'SECURITY' ? (
            <div className="p-6 h-full overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold italic text-red-500 flex items-center gap-2">
                  <ShieldAlert /> AI ANOMALY COMMAND CENTER
                </h3>
              </div>

              <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
                <div className="col-span-8 overflow-y-auto custom-scrollbar space-y-3">
                  <AnimatePresence>
                    {anomalyStream.map(anomaly => (
                      <motion.div
                        key={anomaly.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 bg-black/80 border rounded-xl ${
                          anomaly.actionTaken === 'BLOCK' ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.2)]' :
                          anomaly.actionTaken === 'THROTTLE' ? 'border-amber-500' : 'border-gray-800'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span className="font-mono text-xs text-gray-500">{new Date(anomaly.createdAt).toLocaleTimeString()}</span>
                          <span className={`${
                            anomaly.actionTaken === 'BLOCK' ? 'bg-red-600' : 
                            anomaly.actionTaken === 'THROTTLE' ? 'bg-amber-600' : 'bg-gray-700'
                          } text-[10px] px-2 py-0.5 rounded font-bold`}>
                            {anomaly.actionTaken}
                          </span>
                        </div>
                        <div className="mt-2 text-sm">
                          User <span className="text-cyan-400 font-mono">{anomaly.userId.slice(0, 8)}...</span> flagged with risk score <span className="text-red-500 font-bold">{(anomaly.score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                           {Object.keys(anomaly.reasons).map(r => (
                             <span key={r} className="text-[8px] bg-gray-900 px-2 py-1 rounded text-gray-500 uppercase font-mono">
                               {r}: {anomaly.reasons[r]}
                             </span>
                           ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <aside className="col-span-4 space-y-4">
                  <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl">
                    <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Autonomous Ban rate</h4>
                    <div className="text-3xl font-bold font-mono">{(anomalyStream.filter(a => a.actionTaken === 'BLOCK').length / (anomalyStream.length || 1) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-cyan-950/20 border border-cyan-900/50 p-4 rounded-xl">
                    <h4 className="text-[10px] font-bold text-cyan-400 uppercase mb-2">Baseline Confidence</h4>
                    <div className="text-3xl font-bold font-mono">0.98</div>
                  </div>
                </aside>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {/* --- TRACE INSPECTOR (Drawer) --- */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 w-1/3 h-full bg-gray-950 border-l border-gray-800 shadow-2xl z-50 p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-2 italic">
                <Terminal className="text-cyan-500" /> Trace Inspector
              </h2>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-white"
              >✕</button>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-gray-600 text-[10px] uppercase font-bold mb-3 tracking-widest">🧠 Decision Logic</h3>
                <div className="bg-black/40 p-4 rounded-lg border border-gray-800 font-mono text-sm">
                  <pre className="text-cyan-400 whitespace-pre-wrap">{JSON.stringify(selectedEvent.trace_log?.decision, null, 2)}</pre>
                </div>
              </section>

              <section>
                <h3 className="text-gray-600 text-[10px] uppercase font-bold mb-3 tracking-widest">📊 Metric Snapshots</h3>
                <div className="bg-black/40 p-4 rounded-lg border border-gray-800 font-mono text-sm">
                  <pre className="text-amber-400 whitespace-pre-wrap">{JSON.stringify(selectedEvent.trace_log?.metrics, null, 2)}</pre>
                </div>
              </section>

              <section>
                <h3 className="text-gray-600 text-[10px] uppercase font-bold mb-3 tracking-widest">⏱ Timing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-3 rounded border border-gray-800">
                    <div className="text-[10px] text-gray-500">Latency</div>
                    <div className="text-lg font-mono text-white">{selectedEvent.processing_time_ms}ms</div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded border border-gray-800">
                    <div className="text-[10px] text-gray-500">Priority</div>
                    <div className="text-lg font-mono text-white">#0{selectedEvent.priority_score}</div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}</style>
    </div>
  );
}
