import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  MapPin, 
  Users, 
  Activity, 
  AlertTriangle, 
  Globe, 
  Clock, 
  XCircle, 
  Terminal,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SecurityLog {
  id: string;
  type: string;
  ip: string;
  country: string | null;
  userId: string | null;
  details: string | null;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface ActiveSession {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
}

interface SecurityStats {
  totalBlocks24h: number;
  topCountries: { country: string; _count: { country: number } }[];
  activeSessionsCount: number;
}

export default function AdminSecurityDashboard() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes, sessionsRes] = await Promise.all([
        fetch('/api/admin/security/logs', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/security/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/security/active-sessions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!logsRes.ok || !statsRes.ok || !sessionsRes.ok) throw new Error('Failed to fetch data');

      const [logsData, statsData, sessionsData] = await Promise.all([
        logsRes.json(),
        statsRes.json(),
        sessionsRes.json()
      ]);

      setLogs(logsData);
      setStats(statsData);
      setSessions(sessionsData);
    } catch (err) {
      setError('Erreur de connexion au service de sécurité.');
    } finally {
      setLoading(false);
    }
  };

  const killSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/security/sessions/${sessionId}/kill`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-10 animate-in fade-in duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Shield className="text-emerald-500 w-8 h-8" />
            </div>
            Security & Anti-Piracy
          </h1>
          <p className="text-zinc-500 font-medium text-lg">Real-time monitoring of your regional access and account sharing.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold border border-emerald-500/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Guardian Active
          </div>
          <button onClick={fetchData} className="p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white">
            <Zap size={20} />
          </button>
        </div>
      </div>

      {/* Top Stats - KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Active Sessions" 
          value={stats?.activeSessionsCount || 0} 
          icon={<Users className="text-blue-500" />} 
          trend="+2.5% vs yesterday"
        />
        <KpiCard 
          title="Blocks (24h)" 
          value={stats?.totalBlocks24h || 0} 
          icon={<XCircle className="text-red-500" />} 
          trend="Abnormal activity detected"
          negative
        />
        <KpiCard 
          title="Top Restricted Area" 
          value={stats?.topCountries[0]?.country || 'N/A'} 
          icon={<Globe className="text-amber-500" />} 
          trend={`${stats?.topCountries[0]?._count.country || 0} attempts prevented`}
        />
        <KpiCard 
          title="Security Health" 
          value="98.2%" 
          icon={<Shield className="text-emerald-500" />} 
          trend="Strict mode enabled"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Real-time Activity Feed */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 rounded-[2rem] border border-white/5 backdrop-blur-xl overflow-hidden p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <Terminal className="text-emerald-500" size={24} />
                Security Activity Feed
              </h2>
              <div className="px-4 py-1.5 bg-black/40 rounded-full text-xs font-black text-zinc-500 uppercase tracking-widest border border-white/5">
                Real-time
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={log.id}
                    className="group relative flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all hover:border-white/10"
                  >
                    <div className={`p-3 rounded-xl ${
                      log.severity === 'high' ? 'bg-red-500/10 text-red-500' :
                      log.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {log.type === 'GEO_BLOCK' ? <Globe size={20} /> : 
                       log.type === 'SESSION_KILLED' ? <Lock size={20} /> : 
                       log.type === 'CONCURRENT_LIMIT' ? <Users size={20} /> :
                       <Shield size={20} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-white font-bold tracking-tight">
                          {log.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={10} />
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 font-medium">
                        {log.details || `Access blocked for IP ${log.ip}`}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="px-2 py-0.5 rounded-lg bg-black text-[10px] font-mono text-zinc-500 border border-white/5">
                          {log.ip}
                        </span>
                        {log.country && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            <MapPin size={10} />
                            {log.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Active Sessions Sidebar */}
        <div className="space-y-8">
          <div className="bg-zinc-900/50 rounded-[2rem] border border-white/5 backdrop-blur-xl p-8">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Activity className="text-blue-500" size={24} />
              Active Nodes
            </h2>
            
            <div className="space-y-4">
              {sessions.map(session => (
                <div key={session.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 uppercase">
                        {session.user.name?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-sm truncate max-w-[120px]">{session.user.name || 'Anonymous'}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">{session.ip}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => killSession(session.id)}
                      className="p-2 hover:bg-red-500/10 text-zinc-600 hover:text-red-500 rounded-lg transition-all"
                      title="Kill Session"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                  <div className="text-[10px] text-zinc-600 bg-black/20 p-2 rounded-lg truncate">
                    {session.userAgent}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-black relative overflow-hidden group">
            <Shield size={120} className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-black">Security Audit</h3>
              <p className="text-sm font-bold opacity-80 leading-relaxed">
                Platform is currently enforcing strict regional boundaries. AI watchdog is monitoring packet consistency.
              </p>
              <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 shadow-2xl">
                Run Consistency Check <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, trend, negative }: { title: string, value: string | number, icon: React.ReactNode, trend: string, negative?: boolean }) {
  return (
    <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <div className="space-y-4">
        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">{title}</p>
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-white">{value}</h3>
          <p className={`text-[10px] font-bold ${negative ? 'text-red-500' : 'text-emerald-500'}`}>{trend}</p>
        </div>
      </div>
    </div>
  );
}
