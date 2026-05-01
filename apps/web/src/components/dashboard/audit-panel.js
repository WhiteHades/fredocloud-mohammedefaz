"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/runtime";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText, DownloadSimple } from "@phosphor-icons/react";

export function AuditPanel({ activeMembership, refreshKey }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeMembership || !activeMembership.permissions?.AUDIT_VIEW) return;
    setLoading(true);
    fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/audit-events`, { credentials: "include" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => { if (ok) setEvents(data.events || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeMembership, refreshKey]);

  if (!activeMembership || !activeMembership.permissions?.AUDIT_VIEW) return null;

  const exportUrl = `${apiUrl}/api/workspaces/${activeMembership.workspace.id}/audit-events/export`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Audit Timeline</CardTitle>
          <CardDescription>Record of workspace changes</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={exportUrl} target="_blank" rel="noopener noreferrer">
            <DownloadSimple /> CSV
          </a>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : events.length === 0 ? (
          <Empty title="No audit events yet" description="Actions will be recorded here." />
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase">{ev.action}</p>
                  <p className="text-sm">{ev.summary}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {new Date(ev.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
