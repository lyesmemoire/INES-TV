"use client";

import { useEffect, useState } from "react";
import { Video, Users, TrendingUp, Radio } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    liveMatches: 0,
    totalMatches: 0,
    activeUsers: 0,
    activeStreams: 0,
  });

  useEffect(() => {
    // Mock data - remplacer par vraie API
    setStats({
      liveMatches: 5,
      totalMatches: 28,
      activeUsers: 1247,
      activeStreams: 12,
    });
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Dashboard Admin</h1>
        <p className="text-zinc-500">
          Vue d'ensemble de votre plateforme de streaming
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Radio}
          label="Matchs en direct"
          value={stats.liveMatches}
          color="emerald"
        />
        <StatCard
          icon={Video}
          label="Total matchs"
          value={stats.totalMatches}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Utilisateurs actifs"
          value={stats.activeUsers}
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Streams actifs"
          value={stats.activeStreams}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction
          title="Ajouter un match"
          description="Créer un nouveau match avec sources de streaming"
          href="/admin/matches/new"
          color="emerald"
        />
        <QuickAction
          title="Gérer les streams"
          description="Ajouter/tester des sources M3U8, Facebook, etc."
          href="/admin/streams"
          color="blue"
        />
        <QuickAction
          title="Importer M3U"
          description="Import en masse de chaînes IPTV"
          href="/admin/channels/import"
          color="purple"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors[color]}`}
        >
          <Icon size={24} />
        </div>
      </div>
      <p className="text-3xl font-black mb-1">{value}</p>
      <p className="text-sm text-zinc-500 font-medium">{label}</p>
    </div>
  );
}

function QuickAction({ title, description, href, color }: any) {
  const colors = {
    emerald: "hover:border-emerald-500/50 hover:bg-emerald-500/5",
    blue: "hover:border-blue-500/50 hover:bg-blue-500/5",
    purple: "hover:border-purple-500/50 hover:bg-purple-500/5",
  };

  return (
    <Link
      href={href}
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 transition-all ${colors[color]}`}
    >
      <h3 className="text-lg font-black mb-2">{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
    </Link>
  );
}
