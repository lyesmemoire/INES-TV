'use client';

import React from 'react';
import AdminAdsDashboard from '@/src/components/Admin/AdminAdsDashboard';
import { BarChart3 } from 'lucide-react';

export default function AdsPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="text-amber-400" size={24} />
          Gestion Publicité
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Providers, fréquence, revenus et AI Selector
        </p>
      </div>
      <AdminAdsDashboard />
    </div>
  );
}
