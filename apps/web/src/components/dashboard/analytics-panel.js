"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { apiUrl } from "@/lib/runtime";

export function AnalyticsPanel({ activeWorkspace, refreshKey }) {
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      if (!activeWorkspace) {
        setAnalytics(null);
        return;
      }

      setAnalyticsError("");

      const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/analytics`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAnalyticsError(data.error || "Analytics could not be loaded.");
        setAnalytics(null);
        return;
      }

      setAnalytics(data);
    }

    loadAnalytics();
  }, [activeWorkspace, refreshKey]);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="nfh-panel t-panel-slide" data-open="true">
      <p className="nfh-eyebrow">Analytics</p>
      {analytics ? (
        <div className="mt-[10px] grid gap-[10px]">
          <div className="nfh-divider-grid nfh-divider-grid-3">
            <div className="nfh-subpanel">
              <p className="nfh-eyebrow">Total Goals</p>
              <p className="mt-[5px] text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-[-0.03em]">{analytics.stats.totalGoals}</p>
            </div>
            <div className="nfh-subpanel">
              <p className="nfh-eyebrow">Completed This Week</p>
              <p className="mt-[5px] text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-[-0.03em]">
                {analytics.stats.itemsCompletedThisWeek}
              </p>
            </div>
            <div className="nfh-subpanel">
              <p className="nfh-eyebrow">Overdue Count</p>
              <p className="mt-[5px] text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-[-0.03em]">{analytics.stats.overdueCount}</p>
            </div>
          </div>
          <div className="nfh-subpanel">
            <p className="nfh-eyebrow">Goal Completion</p>
            <div className="mt-[10px] h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={240}>
                <BarChart data={analytics.goalCompletion} margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="currentColor" opacity={0.2} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#ff0000" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-[10px] nfh-muted">
          {analyticsError || "Analytics will appear once a workspace is active."}
        </p>
      )}
    </div>
  );
}
