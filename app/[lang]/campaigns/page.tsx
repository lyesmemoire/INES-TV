"use client";

import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  cpm: number;
  budget: number;
  spent: number;
  geo: string;
  segment: string;
  isActive: boolean;
};

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Form State
  const [name, setName] = useState("");
  const [cpm, setCpm] = useState("0.5");
  const [budget, setBudget] = useState("10");
  const [geo, setGeo] = useState("DZ");
  const [segment, setSegment] = useState("PREMIUM");

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // Zero-cost live polling
    const interval = setInterval(fetchCampaigns, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, cpm, budget, geo, segment }),
    });
    setName("");
    fetchCampaigns();
  };

  const handleToggle = async (id: string) => {
    await fetch(`/campaigns/${id}/toggle`, { method: "PATCH" });
    fetchCampaigns();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/campaigns/${id}`, { method: "DELETE" });
    fetchCampaigns();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col lg:flex-row gap-8">
      {/* LEFT: CREATE FORM */}
      <div className="w-full lg:w-1/3 bg-white p-6 shadow rounded-2xl h-fit">
        <h2 className="text-xl font-bold mb-4">Create Campaign</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <input 
              required 
              type="text" 
              className="w-full border p-2 rounded" 
              placeholder="e.g. DZ Premium" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm text-gray-500">CPM ($)</label>
              <input required type="number" step="0.01" className="w-full border p-2 rounded" value={cpm} onChange={e => setCpm(e.target.value)} />
            </div>
            <div className="w-1/2">
              <label className="text-sm text-gray-500">Budget ($)</label>
              <input required type="number" className="w-full border p-2 rounded" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm text-gray-500">Geo</label>
              <select className="w-full border p-2 rounded" value={geo} onChange={e => setGeo(e.target.value)}>
                <option value="DZ">DZ</option>
                <option value="MA">MA</option>
                <option value="TN">TN</option>
                <option value="FR">FR</option>
                <option value="ALL">ALL</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="text-sm text-gray-500">Segment</label>
              <select className="w-full border p-2 rounded" value={segment} onChange={e => setSegment(e.target.value)}>
                <option value="PREMIUM">PREMIUM</option>
                <option value="STANDARD">STANDARD</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <button type="submit" className="mt-2 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
            Launch Campaign
          </button>
        </form>
      </div>

      {/* RIGHT: CAMPAIGN TABLE */}
      <div className="w-full lg:w-2/3 bg-white p-6 shadow rounded-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
          Active Store
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live Polling</span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="p-2">Name</th>
                <th className="p-2">Bid</th>
                <th className="p-2">Spent / Budget</th>
                <th className="p-2">Target</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-400">No campaigns in RAM store</td>
                </tr>
              ) : campaigns.map(c => {
                const progress = (c.spent / c.budget) * 100;
                return (
                  <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-2 font-medium">{c.name}</td>
                    <td className="p-2 text-green-600 font-semibold">${c.cpm.toFixed(3)}</td>
                    <td className="p-2">
                      <div className="text-xs mb-1">${c.spent.toFixed(2)} / ${c.budget}</div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </td>
                    <td className="p-2 text-sm text-gray-600">{c.geo} • {c.segment}</td>
                    <td className="p-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.isActive ? "LIVE" : "PAUSED"}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button onClick={() => handleToggle(c.id)} className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded mr-2">
                        {c.isActive ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
