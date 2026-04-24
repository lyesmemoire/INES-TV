"use client";

import { useEffect, useState } from "react";

type Metrics = {
  activeStreams: number;
  avgLatency: number;
  errors: number;
  errorRate: number;
  errorRateFormatted?: string;
  topChannels: { channelId: string; _count: { channelId: number } }[];
  p95Latency?: number;
  // SaaS V2 Features
  anomaly?: string;
  healthScore?: number;
  trend?: string;
  planRestricted?: boolean;
};

export default function ControlRoom() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [useSSE, setUseSSE] = useState(true);

  // Phase 7: Real-Time Stream implementation
  useEffect(() => {
    if (!useSSE) return;
    
    setLoading(true);
    const eventSource = new EventSource('/api/metrics/stream');

    eventSource.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        setData(json);
        setLoading(false);
      } catch (e) {
        console.error("Failed parsing SSE", e);
      }
    };

    eventSource.onerror = () => {
      // Fallback to polling if SSE rejected (e.g., FREE plan)
      console.warn("SSE stream failed or forbidden. Falling back to polling.");
      eventSource.close();
      setUseSSE(false);
    };

    return () => eventSource.close();
  }, [useSSE]);

  // Phase 1: Polling Fallback
  useEffect(() => {
    if (useSSE) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/metrics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch(e) {
        console.error("Polling error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // FREE plan default fallback rate
    return () => clearInterval(interval);
  }, [useSSE]);

  if (loading && !data) return <div className="p-6 text-white bg-black min-h-screen font-mono">Booting Telemetry Link...</div>;
  if (!data) return <div className="p-6 text-white bg-black min-h-screen font-mono">Failed to link NOC. Check authorization bounds.</div>;

  return (
    <div className="p-6 space-y-6 bg-black text-white min-h-screen font-mono">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${data.anomaly !== 'OK' && data.anomaly ? 'bg-red-500 animate-bounce' : 'bg-green-500 animate-pulse'}`}></span>
                StreamPerf NOC
            </h1>
            <span className="text-gray-500 text-sm">{useSSE ? "🟢 LIVE FIREHOSE (SSE)" : "🟠 POLLING (FREE PLAN)"}</span>
        </div>
        {data.planRestricted && (
            <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-2 rounded text-sm font-bold">
                PRO UPGRADE REQUIRED FOR SUB-SECOND STREAMING
            </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Concurrent Streams" value={data.activeStreams} />
        <Card title="Avg Latency" value={`${Math.round(data.avgLatency)}ms`} highlight={data.avgLatency > 1500} />
        <Card title="Error Rate" value={data.errorRateFormatted || `${(data.errorRate * 100).toFixed(2)}%`} highlight={data.errorRate > 0.05} />
        
        {/* Phase 9: Smart Insights */}
        <Card title="Global Health" value={`${Math.round(data.healthScore || 100)}/100`} highlight={(data.healthScore || 100) < 80} />
        <div className="bg-blue-900/20 border border-blue-900 p-6 rounded flex flex-col justify-center">
             <div className="text-xs uppercase tracking-wider text-blue-500 mb-2">Trend</div>
             <div className="text-2xl font-bold text-blue-400">{data.trend || "STABLE"}</div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 p-4 rounded mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-300 border-b border-gray-800 pb-2 flex justify-between">
            🔥 Global Channel Flow
            {data.anomaly && data.anomaly !== "OK" && <span className="text-red-500 animate-pulse text-sm">DETECTED ROW: {data.anomaly}</span>}
        </h2>
        {data.topChannels?.length === 0 ? (
           <p className="text-gray-500 italic py-4">No payload metrics intersecting.</p>
        ) : (
          <div className="space-y-3">
            {data.topChannels?.map((c, i) => (
              <div key={c.channelId} className="flex justify-between items-center p-3 bg-black rounded border border-gray-800">
                <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-bold">#{i+1}</span>
                    <span className="text-indigo-400">{c.channelId}</span>
                </div>
                <span className="bg-gray-800 px-3 py-1 rounded text-green-400 font-bold">{c._count.channelId} peers</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, highlight }: { title: string; value: any, highlight?: boolean }) {
  return (
    <div className={`bg-gray-900 p-6 rounded border transition-colors duration-300 ${highlight ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-gray-800 hover:border-gray-600'}`}>
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">{title}</div>
      <div className={`text-3xl font-bold ${highlight ? 'text-red-500' : 'text-white'}`}>{value}</div>
    </div>
  );
}
