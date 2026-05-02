"use client";

import { useEffect, useState, useRef } from "react";
import { BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { apiUrl } from "@/lib/runtime";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartBar, CheckCircle, WarningCircle, Target } from "@phosphor-icons/react";

export function AnalyticsPanel({ activeWorkspace, refreshKey }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartWidth, setChartWidth] = useState(400);
  const chartHostRef = useRef(null);

  useEffect(() => {
    if (!activeWorkspace) return;
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/analytics`, { credentials: "include" });
        const data = await response.json().catch(() => ({}));

        if (!cancelled && response.ok) {
          setAnalytics(data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace, refreshKey]);

  useEffect(() => {
    if (!chartHostRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartWidth(entry.contentRect.width);
      }
    });
    observer.observe(chartHostRef.current);
    return () => observer.disconnect();
  }, []);

  if (!activeWorkspace) return null;

  const stats = analytics?.stats || analytics || {};
  const goalCompletion = analytics?.goalCompletion || [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold font-heading">Analytics</h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <Target className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-heading">{stats.totalGoals ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
                <CheckCircle className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-heading">{stats.itemsCompletedThisWeek ?? stats.completedThisWeek ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <WarningCircle className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold font-heading">{stats.overdueCount ?? 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Goal Completion</CardTitle>
              <CardDescription>Progress across goals</CardDescription>
            </CardHeader>
            <CardContent ref={chartHostRef}>
              {goalCompletion.length > 0 ? (
                <BarChart width={chartWidth} height={300} data={goalCompletion} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      color: "var(--popover-foreground)",
                      borderRadius: "var(--radius)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="progress" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <p className="text-sm text-muted-foreground">No goal data yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
