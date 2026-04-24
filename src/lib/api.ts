export type DashboardStats = {
  impressions: number;
  clicks: number;
  revenue: number;
  fillRate: number;
  subFloorRate: number;
};

export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch("http://localhost:3000/analytics/dashboard", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return res.json();
}
