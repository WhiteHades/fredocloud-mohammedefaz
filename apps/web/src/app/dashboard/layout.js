import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSessionUser } from "@/lib/auth-server";
import { getPendingInvitations, getWorkspaceMemberships } from "@/lib/workspace-server";

export default async function DashboardLayout({ children }) {
  const user = await requireSessionUser();
  const [memberships, pendingInvitations] = await Promise.all([
    getWorkspaceMemberships(),
    getPendingInvitations(),
  ]);

  return (
    <DashboardShell user={user} memberships={memberships} pendingInvitations={pendingInvitations}>
      {children}
    </DashboardShell>
  );
}
