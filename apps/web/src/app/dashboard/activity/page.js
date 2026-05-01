"use client";

import { AuditPanel } from "@/components/dashboard/audit-panel";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { PresencePanel } from "@/components/dashboard/presence-panel";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";

export default function DashboardActivityPage() {
  const { activeMembership, onlineUserIds, realtimeVersion } = useDashboardContext();

  return (
    <div className="grid gap-[10px]">
      <PresencePanel activeWorkspace={activeMembership?.workspace || null} onlineUserIds={onlineUserIds} />
      <NotificationsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />
      <AuditPanel activeMembership={activeMembership || null} refreshKey={realtimeVersion} />
    </div>
  );
}
