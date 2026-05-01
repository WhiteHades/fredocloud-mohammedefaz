"use client";

import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";

export default function DashboardAnalyticsPage() {
  const { activeMembership, realtimeVersion } = useDashboardContext();

  return <AnalyticsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />;
}
