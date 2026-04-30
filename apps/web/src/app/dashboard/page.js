import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSessionUser } from "@/lib/auth-server";

export const metadata = {
  title: "Dashboard | FredoHub",
};

export default async function DashboardPage() {
  const user = await requireSessionUser();

  return <DashboardShell user={user} />;
}
