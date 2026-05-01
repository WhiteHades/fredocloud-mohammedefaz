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
    <div className="mt-10 border border-stone-200 p-4 dark:border-stone-800">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
        Online Members
      </p>
      <div className="mt-4 grid gap-3">
        {onlineMembers.length ? (
          onlineMembers.map((membership) => (
            <div key={membership.id} className="border border-stone-200 px-3 py-3 dark:border-stone-800">
              <p className="text-base text-stone-900 dark:text-stone-50">
                {membership.user?.displayName || membership.user?.email}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                {membership.role}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-stone-900/60 dark:text-stone-50/60">No one else is online.</p>
        )}
      </div>
    </div>
  );
}
