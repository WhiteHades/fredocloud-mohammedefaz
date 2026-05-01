"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { apiUrl } from "@/lib/runtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Bell, ChartBar, Megaphone, Target, WarningCircle } from "@phosphor-icons/react";

function stripHtml(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getUpcomingItems(actionItems) {
  return [...actionItems]
    .filter((item) => item.status !== "DONE")
    .sort((left, right) => {
      const leftDate = left.dueDate ? new Date(left.dueDate).valueOf() : Number.MAX_SAFE_INTEGER;
      const rightDate = right.dueDate ? new Date(right.dueDate).valueOf() : Number.MAX_SAFE_INTEGER;
      return leftDate - rightDate;
    })
    .slice(0, 4);
}

export function OverviewPanel({ activeMembership, onlineUserIds, refreshKey }) {
  const [analytics, setAnalytics] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeMembership) {
      return;
    }

    let cancelled = false;

    async function loadOverview() {
      setLoading(true);

      try {
        const [analyticsResponse, announcementsResponse, actionItemsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/analytics`, { credentials: "include" }),
          fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/announcements`, { credentials: "include" }),
          fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/action-items`, { credentials: "include" }),
        ]);

        const [analyticsData, announcementsData, actionItemsData] = await Promise.all([
          analyticsResponse.json().catch(() => ({})),
          announcementsResponse.json().catch(() => ({})),
          actionItemsResponse.json().catch(() => ({})),
        ]);

        if (cancelled) {
          return;
        }

        if (analyticsResponse.ok) {
          setAnalytics(analyticsData);
        }

        if (announcementsResponse.ok) {
          setAnnouncements(announcementsData.announcements || []);
        }

        if (actionItemsResponse.ok) {
          setActionItems(actionItemsData.actionItems || []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [activeMembership, refreshKey]);

  const stats = analytics?.stats || {};
  const recentAnnouncements = useMemo(() => announcements.slice(0, 3), [announcements]);
  const upcomingItems = useMemo(() => getUpcomingItems(actionItems), [actionItems]);

  if (!activeMembership) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <Card
          className="overflow-hidden border-border/60"
          style={{
            background: `linear-gradient(135deg, ${activeMembership.workspace.accentColor}1F 0%, transparent 45%), var(--card)`,
          }}
        >
          <CardHeader className="gap-4">
            <div className="flex items-center gap-3">
              <span
                className="size-3 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: activeMembership.workspace.accentColor }}
              />
              <Badge variant="outline">{activeMembership.role}</Badge>
              <Badge variant="secondary">{onlineUserIds.length} online</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-heading tracking-tight">{activeMembership.workspace.name}</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {activeMembership.workspace.description || "Collaborative planning for goals, announcements, and action items."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/goals">
                Open Goals <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/workspaces">Manage Workspace</Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href={`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/export`} target="_blank" rel="noreferrer">
                Export CSV
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {loading ? (
            [...Array(3)].map((_, index) => <Skeleton key={index} className="h-28 w-full" />)
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Goals</CardDescription>
                  <CardTitle className="flex items-center justify-between text-3xl font-heading">
                    {stats.totalGoals ?? 0}
                    <Target className="size-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Completed This Week</CardDescription>
                  <CardTitle className="flex items-center justify-between text-3xl font-heading">
                    {stats.itemsCompletedThisWeek ?? 0}
                    <ChartBar className="size-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Overdue Items</CardDescription>
                  <CardTitle className="flex items-center justify-between text-3xl font-heading">
                    {stats.overdueCount ?? 0}
                    <WarningCircle className="size-5 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
              </Card>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Recent Announcements</CardTitle>
                <CardDescription>Workspace-wide updates from admins.</CardDescription>
              </div>
              <Megaphone className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-20 w-full" />)}
              </div>
            ) : recentAnnouncements.length === 0 ? (
              <Empty title="No announcements yet" description="Admins can publish updates here." />
            ) : (
              <div className="flex flex-col gap-3">
                {recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="rounded-2xl border p-4">
                    <div className="flex items-center gap-2">
                      {announcement.pinned && <Badge variant="secondary">Pinned</Badge>}
                      <p className="font-medium">{announcement.title}</p>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {stripHtml(announcement.content)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Focus Items</CardTitle>
                <CardDescription>What needs attention next.</CardDescription>
              </div>
              <Bell className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}
              </div>
            ) : upcomingItems.length === 0 ? (
              <Empty title="Nothing urgent" description="Your action board is looking healthy." />
            ) : (
              <div className="flex flex-col gap-3">
                {upcomingItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant={item.priority === "CRITICAL" ? "destructive" : "outline"}>{item.priority}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{item.status.replaceAll("_", " ")}</span>
                      {item.dueDate && <span>Due {new Date(item.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
