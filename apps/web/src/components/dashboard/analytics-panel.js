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

export function AnalyticsPanel({ activeWorkspace }) {
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
  }, [activeWorkspace]);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="mt-10 border border-stone-200 p-4 dark:border-stone-800">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
        Analytics
      </p>
      {analytics ? (
        <div className="mt-4 grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-stone-200 p-4 dark:border-stone-800">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                Total Goals
              </p>
              <p className="mt-3 text-4xl font-light tracking-tight">{analytics.stats.totalGoals}</p>
            </div>
            <div className="border border-stone-200 p-4 dark:border-stone-800">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                Completed This Week
              </p>
              <p className="mt-3 text-4xl font-light tracking-tight">
                {analytics.stats.itemsCompletedThisWeek}
              </p>
            </div>
            <div className="border border-stone-200 p-4 dark:border-stone-800">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                Overdue Count
              </p>
              <p className="mt-3 text-4xl font-light tracking-tight">{analytics.stats.overdueCount}</p>
            </div>
          </div>
          <div className="border border-stone-200 p-4 dark:border-stone-800">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
              Goal Completion
            </p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.goalCompletion} margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="2 6" stroke="rgba(28,25,23,0.18)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#c8102e" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-stone-900/60 dark:text-stone-50/60">
          {analyticsError || "Analytics will appear once a workspace is active."}
        </p>
      )}
    </div>
  );
}
