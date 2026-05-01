"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

export function PresencePanel({ activeWorkspace, onlineUserIds }) {
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    async function loadMembers() {
      if (!activeWorkspace) {
        setMemberships([]);
        return;
      }

      const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/members`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMemberships([]);
        return;
      }

      setMemberships(data.memberships);
    }

    loadMembers();
  }, [activeWorkspace]);

  if (!activeWorkspace) {
    return null;
  }

  const onlineMembers = memberships.filter((membership) => onlineUserIds.includes(membership.user?.id));

  return (
    <div className="nfh-panel t-panel-slide" data-open="true">
      <p className="nfh-eyebrow">Online Members</p>
      <div className="mt-[10px] grid gap-[10px]">
        {onlineMembers.length ? (
          onlineMembers.map((membership) => (
            <div key={membership.id} className="nfh-subpanel">
              <p className="text-[20px] leading-[1] tracking-[-0.009em]">
                {membership.user?.displayName || membership.user?.email}
              </p>
              <p className="mt-[5px] nfh-eyebrow">
                {membership.role}
              </p>
            </div>
          ))
        ) : (
          <p className="nfh-muted">No one else is online.</p>
        )}
      </div>
    </div>
  );
}
