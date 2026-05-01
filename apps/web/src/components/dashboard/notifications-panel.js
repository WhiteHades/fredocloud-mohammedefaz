"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

export function NotificationsPanel({ activeWorkspace, refreshKey }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadNotifications() {
      if (!activeWorkspace) {
        setNotifications([]);
        return;
      }

      const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/notifications`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNotifications([]);
        return;
      }

      setNotifications(data.notifications);
    }

    loadNotifications();
  }, [activeWorkspace, refreshKey]);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="nfh-panel t-panel-slide" data-open="true">
      <p className="nfh-eyebrow">Notifications</p>
      <div className="mt-[10px] grid gap-[10px]">
        {notifications.length ? (
          notifications.map((notification) => (
            <div key={notification.id} className="nfh-subpanel">
              <p className="nfh-eyebrow">{notification.type}</p>
              <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">
                {notification.title}
              </p>
              <p className="mt-[10px] text-[11px] uppercase tracking-[-0.005em] opacity-70">
                {notification.body}
              </p>
            </div>
          ))
        ) : (
          <p className="nfh-muted">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
