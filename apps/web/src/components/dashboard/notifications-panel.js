"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/runtime";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "@phosphor-icons/react";

export function NotificationsPanel({ activeWorkspace, refreshKey }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) return;
    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/notifications`, { credentials: "include" });
        const data = await response.json().catch(() => ({}));

        if (!cancelled) {
          setNotifications(response.ok ? data.notifications || [] : []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace, refreshKey]);

  if (!activeWorkspace) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold font-heading">Notifications</h3>
          {notifications.length > 0 && <Badge variant="secondary" className="ml-auto">{notifications.length}</Badge>}
        </div>
        {loading ? (
          <div className="flex flex-col gap-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : notifications.length === 0 ? (
          <Empty title="No notifications" description="You're all caught up." />
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase">{n.type}</p>
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
