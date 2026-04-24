import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Zap, AlertTriangle, RefreshCw, BarChart3, Globe, Tv } from 'lucide-react';
import { getQoEStats } from '@/services/analyticsQueries';
import QoEChart from './QoEChart';
import CDNComparisonChart from './CDNComparisonChart';
import CDNChart from './CDNChart';
import ChannelChart from './ChannelChart';

/**
 * 🚀 PRODUCTION ANALYTICS DASHBOARD (SaaS Style)
 * Provides a high-level overview of the streaming infrastructure performance.
 */
export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const data = await getQoEStats();
      setEvents(data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // ── Metrics Calculation ─────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    if (!events.length) return { avgQoE: 0, errorRate: 0, totalSessions: 0, rebuffers: 0 };
    
    const validScores = events.filter(e => e.qoe_score !== undefined && e.qoe_score !== null);
    const avgQoE = validScores.reduce((acc, curr) => acc + curr.qoe_score, 0) / (validScores.length || 1);
    
    const errors = events.filter(e => e.event_type === 'error').length;
    const errorRate = (errors / events.length) * 100;

    const rebuffers = events.filter(e => e.event_type === 'rebuffer').length;

    return {
      avgQoE: Math.round(avgQoE),
      errorRate: errorRate.toFixed(1),
      totalSessions: events.filter(e => e.event_type === 'start').length,
      rebuffers
    };
  }, [events]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-white/40 text-xs font-black uppercase tracking-widest animate-pulse">Initializing Data Stream...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Platform Infrastructure</h1>
          <p className="text-zinc-500 font-medium">Real-time QoE monitoring and CDN orchestration analytics.</p>
        </div>
        
        <button 
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Avg Playback Score" 
          value={metrics.avgQoE} 
          icon={<Zap className="text-emerald-400" />} 
          trend="Lower is better"
          color="emerald"
        />
        <KPICard 
          title="Error Rate" 
          value={`${metrics.errorRate}%`} 
          icon={<AlertTriangle className="text-red-400" />} 
          trend="Production reliability"
          color="red"
        />
        <KPICard 
          title="Active Sessions" 
          value={metrics.totalSessions} 
          icon={<Activity className="text-blue-400" />} 
          trend="Unique playback starts"
          color="blue"
        />
        <KPICard 
          title="Buffer Events" 
          value={metrics.rebuffers} 
          icon={<Shield className="text-purple-400" />} 
          trend="Anti-friction efficiency"
          color="purple"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <QoEChart />
         <CDNChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
         <ChannelChart />
         <CDNComparisonChart />
      </div>

      {/* Secondary Row: Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest opacity-50 mb-6">Recent Critical Events</h3>
            <div className="space-y-4">
               {events.filter(e => e.event_type === 'error' || e.event_type === 'switch').slice(0, 5).map((e, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-lg ${e.event_type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {e.event_type === 'error' ? <AlertTriangle size={16} /> : <Zap size={16} />}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight">{e.event_type === 'error' ? 'Playback Failure' : 'CDN Failover'}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">CDN: {e.cdn} | Channel: {e.channel_id}</p>
                       </div>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-black">{new Date(e.created_at).toLocaleTimeString()}</span>
                 </div>
               ))}
               {events.filter(e => e.event_type === 'error' || e.event_type === 'switch').length === 0 && (
                 <p className="text-zinc-600 text-xs font-medium text-center py-10">No critical events recorded in this period.</p>
               )}
            </div>
         </div>

         <div className="bg-gradient-to-br from-emerald-600/20 to-blue-600/20 border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between">
            <div>
               <h3 className="text-sm font-black text-white uppercase tracking-widest opacity-80 mb-2">Self-Learning Status</h3>
               <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                  The QoE engine is currently optimizing CDN selection based on {events.length} data points.
               </p>
            </div>
            
            <div className="space-y-4">
               <StatusItem icon={<Globe size={14}/>} label="Multi-CDN Grid" status="Online" />
               <StatusItem icon={<Tv size={14}/>} label="Dual-Core Engine" status="Active" />
               <StatusItem icon={<BarChart3 size={14}/>} label="QoE Scoring" status="Calibrated" />
            </div>

            <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all mt-6">
               Download Report (PDF)
            </button>
         </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-500/10`}>{icon}</div>
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Live</span>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-zinc-500 uppercase tracking-widest">{title}</h4>
        <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
      </div>
      <p className="text-[10px] text-zinc-600 font-bold mt-4 uppercase tracking-wider">{trend}</p>
    </motion.div>
  );
}

function StatusItem({ icon, label, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-white/60">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{status}</span>
    </div>
  );
}
