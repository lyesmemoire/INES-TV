import React from "react";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

/**
 * 🧭 ANALYTICS PAGE (Route Container)
 * Container for the full-screen analytics dashboard.
 */
export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white p-8">
      <AnalyticsDashboard />
    </div>
  );
}
