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
    <div className="mt-10 border border-stone-200 p-4 dark:border-stone-800">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
        Notifications
      </p>
      <div className="mt-4 grid gap-3">
        {notifications.length ? (
          notifications.map((notification) => (
            <div key={notification.id} className="border border-stone-200 px-3 py-3 dark:border-stone-800">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                {notification.type}
              </p>
              <p className="mt-2 text-base text-stone-900 dark:text-stone-50">{notification.title}</p>
              <p className="mt-2 text-sm text-stone-900/70 dark:text-stone-50/70">
                {notification.body}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-stone-900/60 dark:text-stone-50/60">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
