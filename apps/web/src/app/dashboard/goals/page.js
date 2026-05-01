"use client";

import { GoalsPanel } from "@/components/dashboard/goals-panel";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";

export default function DashboardGoalsPage() {
  const { activeMembership, realtimeVersion } = useDashboardContext();

  return <GoalsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />;
}
