"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/runtime";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MANAGEABLE_PERMISSIONS = ["ANNOUNCEMENT_PUBLISH", "MEMBER_INVITE", "GOAL_CREATE", "ACTION_ITEM_CREATE"];

export function PermissionsPanel({ activeMembership }) {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeMembership || activeMembership.role !== "ADMIN") return;
    setLoading(true);
    fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/members`, { credentials: "include" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => { if (ok) setMemberships(data.memberships || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeMembership]);

  function togglePermission(membershipId, permission) {
    const member = memberships.find((m) => m.id === membershipId);
    if (!member) return;
    const allowed = !member.permissions?.[permission];
    fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/members/${membershipId}/permissions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ permission, allowed }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setMemberships((prev) =>
          prev.map((m) =>
            m.id === membershipId
              ? { ...m, permissions: { ...m.permissions, [permission]: allowed } }
              : m
          )
        );
      });
  }

  if (!activeMembership || activeMembership.role !== "ADMIN") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Permission Matrix</CardTitle>
        <CardDescription>Manage what each member can do</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : memberships.length === 0 ? (
          <Empty title="No members" description="Invite members to manage permissions." />
        ) : (
          <div className="flex flex-col gap-3">
            {memberships.map((member) => (
              <div key={member.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{member.user.displayName || member.user.email}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MANAGEABLE_PERMISSIONS.map((perm) => {
                    const isActive = member.permissions?.[perm] ?? false;
                    return (
                      <Button
                        key={perm}
                        variant={isActive ? "default" : "outline"}
                        size="xs"
                        className="h-7 text-xs"
                        onClick={() => togglePermission(member.id, perm)}
                      >
                        {perm.replace(/_/g, " ")}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
