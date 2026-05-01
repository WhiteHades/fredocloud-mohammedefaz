"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/runtime";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Circle, Users } from "@phosphor-icons/react";

export function PresencePanel({ activeWorkspace, onlineUserIds }) {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) return;
    let cancelled = false;

    async function loadPresenceMembers() {
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/members`, { credentials: "include" });
        const data = await response.json().catch(() => ({}));

        if (!cancelled && response.ok) {
          setMemberships(data.memberships || []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPresenceMembers();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace]);

  const onlineMembers = memberships.filter((m) => onlineUserIds.includes(m.user.id));

  if (!activeWorkspace) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold font-heading">Online Members</h3>
          {onlineMembers.length > 0 && (
            <Badge variant="secondary" className="ml-auto">{onlineMembers.length}</Badge>
          )}
        </div>
        {loading ? (
          <div className="flex flex-col gap-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : onlineMembers.length === 0 ? (
          <Empty title="No one else is online" description="Online members will appear here." />
        ) : (
          <div className="flex flex-col gap-2">
            {onlineMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-lg border p-2">
                <Circle className="size-2 fill-green-500 text-green-500" weight="fill" />
                <span className="text-sm font-medium">{m.user.displayName || m.user.email}</span>
                <Badge variant="secondary" className="ml-auto">{m.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
