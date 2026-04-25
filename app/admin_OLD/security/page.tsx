"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  History, 
  AlertTriangle,
  Smartphone,
  ChevronRight,
  UserX,
  Database,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SecurityStats {
  sessionsCount: number;
  criticalAlerts: number;
  uptime: string;
}

export default function SecurityManagement() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [is2faEnabled, setIs2faEnabled] = useState(false);

  useEffect(() => {
    setStats({
        sessionsCount: 12,
        criticalAlerts: 0,
        uptime: "99.98%"
    });
  }, []);

  const handleSetup2FA = async () => {
    try {
        const adminToken = localStorage.getItem("adminToken");
        const res = await fetch("/api/admin/2fa/setup", {
            method: "POST",
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json();
        setQrCode(data.qrCode);
        setShow2faSetup(true);
    } catch (e) {
        console.error(e);
    }
  };

  const handleVerify2FA = async () => {
    try {
        const adminToken = localStorage.getItem("adminToken");
        const res = await fetch("/api/admin/security/2fa/verify", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${adminToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (data.success) {
            setIs2faEnabled(true);
            setShow2faSetup(false);
            alert("2FA Activé avec succès !");
        } else {
            alert("Token invalide.");
        }
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
          <h1 className="text-3xl font-bold tracking-tight">Security & Privacy</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your administrator identity and session security.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 🔐 MFA / 2FA CARD */}
          <div className="bg-[#111827] border border-gray-800/50 rounded-2xl p-8 flex flex-col relative overflow-hidden backdrop-blur-xl">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 mb-6 font-black translate-x-1">
                  <Smartphone size={24} />
              </div>

              <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
                  {is2faEnabled ? (
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold rounded-full">Active</span>
                  ) : (
                      <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-full">Recommended</span>
                  )}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-sm font-medium">Protect your admin account with TOTP codes from Google Authenticator or similar apps.</p>

              {!is2faEnabled && !show2faSetup && (
                  <button 
                    onClick={handleSetup2FA}
                    className="mt-6 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg font-bold text-sm tracking-tight transition-all shadow-lg shadow-indigo-500/10 w-fit px-8"
                  >
                      Set up 2FA
                  </button>
              )}

              {show2faSetup && (
                  <div className="space-y-8 animate-in slide-in-from-bottom duration-300">
                      <div className="bg-white p-4 rounded-xl w-fit mx-auto border border-white/10 shadow-2xl">
                          {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />}
                      </div>
                      
                      <div className="space-y-4">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest text-center">Enter 6-digit code</p>
                          <input 
                            type="text" 
                            maxLength={6}
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="000000"
                            className="w-full bg-black border border-gray-800 rounded-xl py-3 text-center text-xl font-bold tracking-[0.5em] focus:border-indigo-500 focus:outline-none transition-all placeholder-gray-800"
                          />
                          <button 
                            onClick={handleVerify2FA}
                            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm transition-all"
                          >
                              Verify and Activate
                          </button>
                      </div>
                  </div>
              )}

              {is2faEnabled && (
                  <div className="mt-6 flex items-center gap-3 text-green-500 text-sm font-bold bg-green-500/5 p-4 rounded-xl border border-green-500/10">
                      <ShieldCheck size={18} />
                      Account fully secured via TOTP.
                  </div>
              )}
          </div>

          <div className="space-y-8">
              <SecurityModule 
                 title="Infrastructure Stability" 
                 icon={<Database size={20} />} 
                 items={[
                     { label: "Database Isolation", value: "Synchro OK", status: "good" },
                     { label: "IP Whitelisting", value: "Strict Mode", status: "good" },
                     { label: "Audit Log Rotation", value: "30 Days", status: "stable" }
                 ]} 
              />
              <SecurityModule 
                 title="Recent Activity" 
                 icon={<AlertTriangle size={20} />} 
                 items={[
                     { label: "Bruteforce Defense", value: "12 IPs Dropped", status: "alert" },
                     { label: "Login Anomaly", value: "None", status: "good" }
                 ]} 
              />
          </div>
      </div>
    </div>
  );
}

function SecurityModule({ title, icon, items }: any) {
    return (
        <div className="bg-[#111827] border border-gray-800/50 rounded-2xl p-8 flex flex-col backdrop-blur-md">
            <div className="flex items-center gap-2 mb-8 opacity-80">
                <span className="text-indigo-500">{icon}</span>
                <h3 className="text-lg font-bold">{title}</h3>
            </div>

            <div className="space-y-3">
                {items.map((item: any) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-white/[0.02] border border-gray-800/30 rounded-xl hover:border-gray-700 transition-colors">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-tight">{item.label}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white tracking-tight">{item.value}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "good" ? "bg-green-500" : 
                                item.status === "stable" ? "bg-blue-500" : 
                                "bg-amber-500"
                            }`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
