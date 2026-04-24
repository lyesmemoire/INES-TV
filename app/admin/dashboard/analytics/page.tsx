'use client';

import React from 'react';
import AdminRevenueDashboard from '@/src/components/Admin/AdminRevenueDashboard';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <TrendingUp className="text-emerald-400" size={24} />
          Analytics & Finance
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          MRR, ARPU, LTV, Churn — métriques SaaS temps réel
        </p>
      </div>
      <AdminRevenueDashboard />
    </div>
  );
}
