"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

export function AuditPanel({ activeMembership }) {
  const [auditError, setAuditError] = useState("");
  const [auditEvents, setAuditEvents] = useState([]);

  useEffect(() => {
    async function loadAuditEvents() {
      if (!activeMembership?.permissions?.AUDIT_VIEW) {
        setAuditEvents([]);
        return;
      }

      setAuditError("");

      const response = await fetch(
        `${apiUrl}/api/workspaces/${activeMembership.workspace.id}/audit-events`,
        {
          credentials: "include",
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAuditError(data.error || "Audit events could not be loaded.");
        setAuditEvents([]);
        return;
      }

      setAuditEvents(data.auditEvents);
    }

    loadAuditEvents();
  }, [activeMembership]);

  if (!activeMembership?.permissions?.AUDIT_VIEW) {
    return null;
  }

  return (
    <div className="mt-10 border border-stone-200 p-4 dark:border-stone-800">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
          Audit Timeline
        </p>
        <a
          className="min-h-[44px] border border-stone-900 px-3 py-2 text-xs uppercase tracking-[0.2em] transition hover:bg-stone-900 hover:text-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-50 dark:hover:bg-stone-50 dark:hover:text-stone-950 dark:focus-visible:ring-stone-50"
          href={`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/audit-events/export`}
          target="_blank"
          rel="noreferrer"
        >
          Export CSV
        </a>
      </div>
      <div className="mt-4 grid gap-3">
        {auditEvents.map((event) => (
          <div key={event.id} className="border border-stone-200 p-4 dark:border-stone-800">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
              {event.action}
            </p>
            <p className="mt-3 text-xl font-light tracking-tight">{event.summary}</p>
            <p className="mt-2 text-sm text-stone-900/60 dark:text-stone-50/60">
              {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {!auditEvents.length ? (
          <p className="text-sm text-stone-900/60 dark:text-stone-50/60">
            No audit events yet.
          </p>
        ) : null}
        {auditError ? (
          <p className="border border-[#c8102e]/20 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#9d1028] dark:text-[#ff8c9d]">
            {auditError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
