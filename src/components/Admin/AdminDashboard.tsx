import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, RefreshCw, AlertCircle, Edit2, Check, X, Shield } from 'lucide-react';
import { Channel } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Channel>>({});
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/channels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return; // Fix: Prevent parsing HTML as JSON
      const data = await res.json();
      setChannels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (channel: Channel) => {
    setEditingId(channel.id);
    setEditForm(channel);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/channels/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Channel updated successfully!' });
        fetchChannels();
        setEditingId(null);
      } else {
        throw new Error('Failed to update');
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error updating channel.' });
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const syncM3U = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sync/channels', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        setStatusMsg({ type: 'error', text: 'Sync failed: Unauthorized or Not Found' });
        return;
      }
      fetchChannels();
      setStatusMsg({ type: 'success', text: 'M3U Sync triggered!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Sync failed.' });
    }
    setTimeout(() => setStatusMsg(null), 3000);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-white">Access Restricted</h2>
        <p className="text-zinc-500 mt-2">You need administrator privileges to view this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Shield className="text-emerald-500" /> Admin Control Center
          </h1>
          <p className="text-zinc-500 font-medium">Manage your streaming ecosystem in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={syncM3U} 
            disabled={loading}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 border border-white/5 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Sync M3U
          </button>
        </div>
      </div>

      {statusMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} font-bold flex items-center gap-3`}
        >
          {statusMsg.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {statusMsg.text}
        </motion.div>
      )}

      <div className="bg-zinc-900/50 rounded-[2rem] border border-white/5 overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-6 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Live</th>
                <th className="p-6 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Score / Status</th>
                <th className="p-6 text-xs font-black text-zinc-500 uppercase tracking-widest">Channel Name</th>
                <th className="p-6 text-xs font-black text-zinc-500 uppercase tracking-widest">Category</th>
                <th className="p-6 text-xs font-black text-zinc-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {channels.map(channel => (
                <tr key={channel.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6 text-center">
                    <div className="flex justify-center">
                      <div className={`w-3 h-3 rounded-full ${channel.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    {editingId === channel.id ? (
                      <input 
                        type="text" 
                        value={editForm.score || ''} 
                        onChange={e => setEditForm({ ...editForm, score: e.target.value })}
                        className="w-20 bg-black border border-white/20 rounded-lg px-2 py-1 text-center text-emerald-400 font-mono font-black"
                      />
                    ) : (
                      <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{channel.score || 'VS'}</span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {channel.thumbnail && <img src={channel.thumbnail} className="w-10 h-10 rounded-lg object-cover" />}
                      {editingId === channel.id ? (
                        <input 
                          type="text" 
                          value={editForm.name || ''} 
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="bg-black border border-white/20 rounded-lg px-3 py-1 text-white font-bold w-full"
                        />
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{channel.name}</span>
                          <span className="text-[10px] text-zinc-600 font-mono truncate max-w-[200px]">{channel.streamUrl}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    {editingId === channel.id ? (
                      <input 
                        type="text" 
                        value={editForm.category || ''} 
                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        className="bg-black border border-white/20 rounded-lg px-3 py-1 text-white/70 text-sm"
                      />
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-white/50 uppercase tracking-wider">{channel.category}</span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      {editingId === channel.id ? (
                        <>
                          <button onClick={() => handleUpdate(channel.id)} className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all"><Save size={16} /></button>
                          <button onClick={cancelEdit} className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"><X size={16} /></button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(channel)} className="p-2 bg-white/5 text-zinc-400 rounded-lg hover:bg-white/10 hover:text-white transition-all"><Edit2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {channels.length === 0 && !loading && (
          <div className="p-20 text-center text-zinc-500 font-medium">No channels found in database. Sync M3U first.</div>
        )}
      </div>
    </div>
  );
}
