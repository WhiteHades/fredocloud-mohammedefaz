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
    <div className="nfh-panel t-panel-slide" data-open="true">
      <p className="nfh-eyebrow">Permission Matrix</p>
      <div className="mt-[10px] grid gap-[10px]">
        {memberships.map((membership) => (
          <div key={membership.id} className="nfh-subpanel">
            <p className="nfh-eyebrow">{membership.role}</p>
            <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">
              {membership.user?.displayName || membership.user?.email}
            </p>
            <div className="mt-[10px] flex flex-wrap gap-[10px]">
              {MANAGEABLE_PERMISSIONS.map((permission) => (
                <button
                  key={permission}
                  className={`nfh-chip ${
                    membership.permissions?.[permission]
                      ? "nfh-chip-active"
                      : ""
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
        {permissionError ? <p className="nfh-error">{permissionError}</p> : null}
      </div>
    </div>
  );
}
