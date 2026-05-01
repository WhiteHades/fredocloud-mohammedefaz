"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

export function AuditPanel({ activeMembership, refreshKey }) {
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
  }, [activeMembership, refreshKey]);

  if (!activeMembership?.permissions?.AUDIT_VIEW) {
    return null;
  }

  return (
    <div className="nfh-panel t-panel-slide" data-open="true">
      <div className="flex items-center justify-between gap-[10px]">
        <p className="nfh-eyebrow">Audit Timeline</p>
        <a
          className="nfh-pill"
          href={`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/audit-events/export`}
          target="_blank"
          rel="noreferrer"
        >
          Export CSV
        </a>
      </div>
      <div className="mt-[10px] grid gap-[10px]">
        {auditEvents.map((event) => (
          <div key={event.id} className="nfh-subpanel">
            <p className="nfh-eyebrow">{event.action}</p>
            <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">{event.summary}</p>
            <p className="mt-[10px] nfh-muted">
              {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {!auditEvents.length ? (
          <p className="nfh-muted">No audit events yet.</p>
        ) : null}
        {auditError ? <p className="nfh-error">{auditError}</p> : null}
      </div>
    </div>
  );
}
