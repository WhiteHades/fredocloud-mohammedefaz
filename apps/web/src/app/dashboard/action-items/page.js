"use client";

import { ActionItemsPanel } from "@/components/dashboard/action-items-panel";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";

export default function DashboardActionItemsPage() {
  const { activeMembership, realtimeVersion } = useDashboardContext();

  return <ActionItemsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />;
}
