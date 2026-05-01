"use client";

import { AuditPanel } from "@/components/dashboard/audit-panel";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";
import { PresencePanel } from "@/components/dashboard/presence-panel";
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel";
import { AnnouncementsPanel } from "@/components/dashboard/announcements-panel";
import { ActionItemsPanel } from "@/components/dashboard/action-items-panel";
import { GoalsPanel } from "@/components/dashboard/goals-panel";
import { PermissionsPanel } from "@/components/dashboard/permissions-panel";
import { OverviewPanel } from "@/components/dashboard/overview-panel";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";

export function DashboardOverviewRoutePanel() {
  const { activeMembership, onlineUserIds, realtimeVersion } = useDashboardContext();

  return <OverviewPanel activeMembership={activeMembership || null} onlineUserIds={onlineUserIds} refreshKey={realtimeVersion} />;
}

export function DashboardGoalsRoutePanel() {
  const { activeMembership, realtimeVersion } = useDashboardContext();

  return <GoalsPanel activeMembership={activeMembership || null} refreshKey={realtimeVersion} />;
}

export function DashboardAnnouncementsRoutePanel() {
  const { activeMembership, lastRealtimeEvent } = useDashboardContext();

  return <AnnouncementsPanel activeMembership={activeMembership || null} lastRealtimeEvent={lastRealtimeEvent} />;
}

export function DashboardActionItemsRoutePanel() {
  const { activeMembership, realtimeVersion } = useDashboardContext();

  return <ActionItemsPanel activeMembership={activeMembership || null} refreshKey={realtimeVersion} />;
}

export function DashboardAnalyticsRoutePanel() {
  const { activeMembership, realtimeVersion } = useDashboardContext();

  return <AnalyticsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />;
}

export function DashboardActivityRoutePanel() {
  const { activeMembership, onlineUserIds, realtimeVersion } = useDashboardContext();

  return (
    <div className="flex flex-col gap-4">
      <PresencePanel activeWorkspace={activeMembership?.workspace || null} onlineUserIds={onlineUserIds} />
      <NotificationsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />
      <AuditPanel activeMembership={activeMembership || null} refreshKey={realtimeVersion} />
    </div>
  );
}

export function DashboardSettingsRoutePanel() {
  const {
    activeMembership,
    avatarError,
    handleAvatarUpload,
    isUploadingAvatar,
    mergeWorkspaceUpdate,
    setDashboardUser,
    user,
  } = useDashboardContext();

  return (
    <SettingsPanel
      key={`${activeMembership?.workspace.id || "workspace"}:${user?.id || "user"}`}
      activeMembership={activeMembership || null}
      avatarError={avatarError}
      handleAvatarUpload={handleAvatarUpload}
      isUploadingAvatar={isUploadingAvatar}
      mergeWorkspaceUpdate={mergeWorkspaceUpdate}
      setDashboardUser={setDashboardUser}
      user={user}
    />
  );
}
