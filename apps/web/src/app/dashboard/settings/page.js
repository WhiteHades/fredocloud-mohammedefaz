"use client";

import { PermissionsPanel } from "@/components/dashboard/permissions-panel";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";

export default function DashboardSettingsPage() {
  const { activeMembership } = useDashboardContext();

  return <PermissionsPanel activeMembership={activeMembership || null} />;
}
