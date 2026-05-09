"use client";

import { useEffect, useState } from "react";

type Snapshot = any;

export default function AnalyticsPage() {
  const [data, setData] = useState<Snapshot | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/analytics/live");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch(e) {}
    };

    load();
    const i = setInterval(load, 10000); // Réduit de 2s à 10s pour économiser les ressources
    return () => clearInterval(i);
  }, []);

  if (!data) return <div className="p-8">Loading Analytics Kernel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-6">
      <h1 className="text-2xl font-bold">AdX Analytics (Truth Layer)</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Total Impressions" value={data.impressions} />
        <Card label="Total Clicks" value={data.clicks} />
        <Card label="Total Revenue ($)" value={data.revenue.toFixed(4)} />
        <Card label="Global RPM ($)" value={data.rpm.toFixed(4)} />
        <Card label="Estimated Fill-Rate" value={`${(data.fillRate * 100).toFixed(1)}%`} />
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4 border-b pb-2">Geo Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(data.geo).map(([k, v]: any) => (
          <div key={k} className="p-5 bg-white shadow rounded-xl">
            <div className="text-lg font-bold text-blue-600 mb-2 border-b pb-1">{k}</div>
            <div className="flex justify-between text-gray-700 py-1">
              <span>Impressions</span>
              <span className="font-semibold">{v.imp}</span>
            </div>
            <div className="flex justify-between text-gray-700 py-1">
              <span>Revenue</span>
              <span className="font-semibold text-green-600">${v.rev.toFixed(4)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ label, value }: any) {
  return (
    <div className="p-5 bg-white shadow rounded-xl flex flex-col gap-1">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}
