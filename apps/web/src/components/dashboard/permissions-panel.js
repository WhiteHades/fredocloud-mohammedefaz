"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

const MANAGEABLE_PERMISSIONS = [
  "ANNOUNCEMENT_PUBLISH",
  "MEMBER_INVITE",
  "GOAL_CREATE",
  "ACTION_ITEM_CREATE",
];

export function PermissionsPanel({ activeMembership }) {
  const [memberships, setMemberships] = useState([]);
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    async function loadMembers() {
      if (!activeMembership || activeMembership.role !== "ADMIN") {
        setMemberships([]);
        return;
      }

      setPermissionError("");

      const response = await fetch(
        `${apiUrl}/api/workspaces/${activeMembership.workspace.id}/members`,
        {
          credentials: "include",
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPermissionError(data.error || "Members could not be loaded.");
        setMemberships([]);
        return;
      }

      setMemberships(data.memberships);
    }

    loadMembers();
  }, [activeMembership]);

  async function handleTogglePermission(membershipId, permission, currentValue) {
    const response = await fetch(
      `${apiUrl}/api/workspaces/${activeMembership.workspace.id}/members/${membershipId}/permissions`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          permission,
          allowed: !currentValue,
        }),
      },
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setPermissionError(data.error || "Permission update failed.");
      return;
    }

    setMemberships((currentMemberships) =>
      currentMemberships.map((membership) =>
        membership.id === membershipId ? data.membership : membership,
      ),
    );
  }

  if (!activeMembership || activeMembership.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="mt-10 border border-stone-200 p-4 dark:border-stone-800">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
        Permission Matrix
      </p>
      <div className="mt-4 grid gap-4">
        {memberships.map((membership) => (
          <div key={membership.id} className="border border-stone-200 p-4 dark:border-stone-800">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
              {membership.role}
            </p>
            <p className="mt-3 text-xl font-light tracking-tight">
              {membership.user?.displayName || membership.user?.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {MANAGEABLE_PERMISSIONS.map((permission) => (
                <button
                  key={permission}
                  className={`min-h-[44px] border px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${
                    membership.permissions?.[permission]
                      ? "border-stone-900 bg-stone-900 text-stone-50 dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950"
                      : "border-stone-300 text-stone-900 hover:bg-stone-900 hover:text-stone-50 dark:border-stone-700 dark:text-stone-50 dark:hover:bg-stone-50 dark:hover:text-stone-950"
                  }`}
                  onClick={() =>
                    handleTogglePermission(
                      membership.id,
                      permission,
                      membership.permissions?.[permission],
                    )
                  }
                  type="button"
                >
                  {permission.toLowerCase().replaceAll("_", " ")}
                </button>
              ))}
            </div>
          </div>
        ))}
        {permissionError ? (
          <p className="border border-[#c8102e]/20 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#9d1028] dark:text-[#ff8c9d]">
            {permissionError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
