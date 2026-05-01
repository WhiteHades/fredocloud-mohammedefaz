"use client";

import { AnnouncementsPanel } from "@/components/dashboard/announcements-panel";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";

export default function DashboardAnnouncementsPage() {
  const { activeMembership, realtimeVersion } = useDashboardContext();

  return <AnnouncementsPanel activeMembership={activeMembership || null} refreshKey={realtimeVersion} />;
}
