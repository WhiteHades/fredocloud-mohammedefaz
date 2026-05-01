"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import { AnimeIntro } from "@/components/app-shell/anime-intro";
import { apiUrl } from "@/lib/runtime";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { DashboardProvider } from "./dashboard-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/workspaces", label: "Workspaces" },
  { href: "/dashboard/goals", label: "Goals" },
  { href: "/dashboard/announcements", label: "Announcements" },
  { href: "/dashboard/action-items", label: "Action Items" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/activity", label: "Activity" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function DashboardShell({ children, user, memberships, pendingInvitations }) {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);
  const syncMemberships = useWorkspaceStore((state) => state.syncMemberships);
  const [avatarError, setAvatarError] = useState("");
  const [invitationError, setInvitationError] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [socketToken, setSocketToken] = useState(null);

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  useEffect(() => {
    syncMemberships(memberships);
  }, [memberships, syncMemberships]);

  const activeMembership =
    memberships.find(({ workspace }) => workspace.id === activeWorkspaceId) || memberships[0] || null;

  useEffect(() => {
    async function loadSocketToken() {
      try {
        const response = await fetch(`${apiUrl}/api/auth/socket-token`, {
          credentials: "include",
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setSocketToken(null);
          return;
        }

        setSocketToken(data.socketToken || null);
      } catch {
        setSocketToken(null);
      }
    }

    loadSocketToken();
  }, [user.id]);

  useEffect(() => {
    if (!socketToken) {
      return undefined;
    }

    const socketBaseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || undefined;
    const socket = io(socketBaseUrl, {
      path: "/socket.io",
      auth: {
        token: socketToken,
      },
      withCredentials: true,
    });

    socket.on("connect", () => {
      if (activeMembership?.workspace.id) {
        socket.emit("workspace:subscribe", { workspaceId: activeMembership.workspace.id });
      }
    });

    socket.on("workspace:presence", ({ workspaceId, onlineUserIds: ids }) => {
      if (workspaceId === activeMembership?.workspace.id) {
        setOnlineUserIds(ids);
      }
    });

    const bumpRealtime = () => setRealtimeVersion((value) => value + 1);

    [
      "goal:created",
      "goal:milestone_created",
      "goal:update_posted",
      "announcement:created",
      "announcement:updated",
      "announcement:reaction",
      "announcement:comment_created",
      "action_item:created",
      "action_item:updated",
    ].forEach((eventName) => {
      socket.on(eventName, ({ workspaceId }) => {
        if (workspaceId === activeMembership?.workspace.id) {
          bumpRealtime();
        }
      });
    });

    socket.on("notification:created", ({ userId, workspaceId }) => {
      if (userId === user.id && workspaceId === activeMembership?.workspace.id) {
        bumpRealtime();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeMembership?.workspace.id, socketToken, user.id]);

  async function handleLogout() {
    setIsLoggingOut(true);

    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    clearUser();
    router.push("/login");
    router.refresh();
    setIsLoggingOut(false);
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAvatarError("");
    setIsUploadingAvatar(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${apiUrl}/api/auth/avatar`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAvatarError(data.error || "Avatar upload failed.");
        setIsUploadingAvatar(false);
        return;
      }

      setUser(data.user);
      router.refresh();
    } catch {
      setAvatarError("Upload failed. Check your connection.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleCreateWorkspace(event) {
    event.preventDefault();

    setWorkspaceError("");
    setIsCreatingWorkspace(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${apiUrl}/api/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          accentColor: formData.get("accentColor"),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setWorkspaceError(data.error || "Workspace creation failed.");
        setIsCreatingWorkspace(false);
        return;
      }

      setActiveWorkspaceId(data.workspace.id);
      router.refresh();
      event.currentTarget.reset();
    } catch {
      setWorkspaceError("Could not reach the server.");
    } finally {
      setIsCreatingWorkspace(false);
    }
  }

  async function handleSendInvitation(event) {
    event.preventDefault();

    if (!activeMembership) {
      return;
    }

    setInvitationError("");
    setIsSendingInvitation(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(
        `${apiUrl}/api/workspaces/${activeMembership.workspace.id}/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: formData.get("email"),
            role: formData.get("role"),
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setInvitationError(data.error || "Invitation could not be sent.");
        setIsSendingInvitation(false);
        return;
      }

      event.currentTarget.reset();
    } catch {
      setInvitationError("Could not reach the server.");
    } finally {
      setIsSendingInvitation(false);
    }

    router.refresh();
  }

  async function handleAcceptInvitation(invitationId) {
    const response = await fetch(`${apiUrl}/api/workspaces/invitations/${invitationId}/accept`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setInvitationError(data.error || "Invitation could not be accepted.");
      return;
    }

    router.refresh();
  }

  const contextValue = useMemo(
    () => ({
      activeMembership,
      avatarError,
      handleAcceptInvitation,
      handleAvatarUpload,
      handleCreateWorkspace,
      handleLogout,
      handleSendInvitation,
      invitationError,
      isCreatingWorkspace,
      isLoggingOut,
      isSendingInvitation,
      isUploadingAvatar,
      memberships,
      onlineUserIds,
      pendingInvitations,
      realtimeVersion,
      setActiveWorkspaceId,
      user,
      workspaceError,
    }),
    [
      activeMembership,
      avatarError,
      invitationError,
      isCreatingWorkspace,
      isLoggingOut,
      isSendingInvitation,
      isUploadingAvatar,
      memberships,
      onlineUserIds,
      pendingInvitations,
      realtimeVersion,
      setActiveWorkspaceId,
      user,
      workspaceError,
    ],
  );

  return (
    <DashboardProvider value={contextValue}>
      <main className="min-h-screen bg-background text-foreground">
        <AnimeIntro>
          <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-[10px] px-4 py-4 md:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
            <aside className="nfh-panel t-panel-slide sticky top-4 h-[calc(100dvh-2rem)] overflow-hidden" data-anime-item data-open="true">
              <div className="flex h-full flex-col gap-[10px]">
                <div className="border-b border-current pb-[10px]">
                  <p className="nfh-eyebrow">notFredoHub</p>
                  <h1 className="mt-[5px] text-[clamp(1.75rem,3vw,2.75rem)] leading-[0.9] tracking-[-0.03em]">
                    Team hub.
                  </h1>
                  <p className="mt-[10px] nfh-muted">Complete team management system for FredoCloud.</p>
                </div>

                <nav className="grid gap-[10px]">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        className={`nfh-chip justify-start ${isActive ? "nfh-chip-active" : ""}`}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto nfh-stack border-t border-current pt-[10px]">
                  <div className="nfh-subpanel">
                    <p className="nfh-eyebrow">Active Workspace</p>
                    <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">
                      {activeMembership?.workspace.name || "No workspace"}
                    </p>
                    <p className="mt-[10px] nfh-muted">{activeMembership?.role || "Guest"}</p>
                  </div>
                  <div className="nfh-subpanel">
                    <p className="nfh-eyebrow">Session</p>
                    <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">
                      {user.displayName || user.email}
                    </p>
                  </div>
                  <button
                    className="nfh-pill"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    type="button"
                  >
                    {isLoggingOut ? "Signing out…" : "Log out"}
                  </button>
                </div>
              </div>
            </aside>

            <section className="min-w-0" data-anime-item>
              <div className="nfh-panel t-panel-slide min-h-[calc(100dvh-2rem)]" data-open="true">
                {children}
              </div>
            </section>
          </div>
        </AnimeIntro>
      </main>
    </DashboardProvider>
  );
}
