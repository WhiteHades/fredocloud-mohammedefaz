"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { apiUrl } from "@/lib/runtime";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AnalyticsPanel } from "./analytics-panel";
import { AnnouncementsPanel } from "./announcements-panel";
import { ActionItemsPanel } from "./action-items-panel";
import { AuditPanel } from "./audit-panel";
import { GoalsPanel } from "./goals-panel";
import { NotificationsPanel } from "./notifications-panel";
import { PermissionsPanel } from "./permissions-panel";
import { PresencePanel } from "./presence-panel";

export function DashboardShell({ user, memberships, pendingInvitations }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);
  const syncMemberships = useWorkspaceStore((state) => state.syncMemberships);
  const [avatarError, setAvatarError] = useState("");
  const [invitationError, setInvitationError] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const [workspaceError, setWorkspaceError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  useEffect(() => {
    syncMemberships(memberships);
  }, [memberships, syncMemberships]);

  const activeMembership =
    memberships.find(({ workspace }) => workspace.id === activeWorkspaceId) || memberships[0] || null;

  useEffect(() => {
    const socketBaseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
    const socket = io(socketBaseUrl, {
      path: socketBaseUrl ? "/socket.io" : "/api/socket.io",
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
  }, [activeMembership?.workspace.id, user.id]);

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

  return (
    <main className="flex-1">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-12 gap-[10px] px-4 py-16 md:px-8 md:py-24 lg:py-32">
        <div className="col-span-12 flex flex-col gap-[10px] md:col-span-8">
          <div className="nfh-panel t-panel-slide" data-open="true">
            <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Protected Workspace
            </p>
            <h1 className="mt-[10px] text-[clamp(2rem,5vw,3rem)] font-medium leading-[0.95] tracking-[-0.02em]">
              Welcome, {user.displayName || user.email}.
            </h1>
            <p className="mt-[10px] text-[20px] leading-[1] tracking-[-0.009em] opacity-70">
              The dashboard route is protected by the current cookie session.
            </p>
          </div>

          <div className="nfh-panel t-panel-slide" data-open="true">
            <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Workspace Context
            </p>
            {memberships.length ? (
              <div className="mt-[10px] flex flex-col gap-[10px] md:grid md:grid-cols-2">
                {memberships.map((membership) => {
                  const isActive = membership.workspace.id === (activeMembership?.workspace.id || "");

                  return (
                    <button
                      key={membership.id}
                      className={`border p-[20px] text-left transition-transform hover:scale-[1.01] active:scale-[0.99] ${
                        isActive
                          ? "border-current bg-black text-[#e6e6dd]"
                          : "border-current bg-transparent"
                      }`}
                      onClick={() => setActiveWorkspaceId(membership.workspace.id)}
                      type="button"
                    >
                      <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                        {membership.role}
                      </p>
                      <p className="mt-[5px] text-[20px] font-medium tracking-[-0.009em]">
                        {membership.workspace.name}
                      </p>
                      <p className="mt-[5px] text-[11px] uppercase tracking-[-0.005em] opacity-60">
                        {membership.workspace.description || "No description yet."}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-[10px] text-[11px] uppercase tracking-[-0.005em] opacity-60">
                No workspace yet. Create one below to begin.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-[10px]">
            <div className="nfh-subpanel t-panel-slide" data-open="true">
              <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">Email</p>
              <p className="mt-[5px] text-[20px] tracking-[-0.009em]">{user.email}</p>
            </div>
            <div className="nfh-subpanel t-panel-slide" data-open="true">
              <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">Profile ID</p>
              <p className="mt-[5px] font-mono text-[11px] tracking-[-0.005em]">{user.id}</p>
            </div>
          </div>

          <div className="nfh-panel t-panel-slide" data-open="true">
            <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Create Workspace
            </p>
            <form className="mt-[10px] flex flex-col gap-[10px]" onSubmit={handleCreateWorkspace}>
              <label className="flex flex-col gap-[5px]">
                <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">Name</span>
                <input
                  className="h-[48px] border border-current bg-transparent px-[16px] text-[20px] tracking-[-0.009em] outline-none focus:ring-2 focus:ring-accent"
                  name="name"
                  required
                  type="text"
                />
              </label>
              <label className="flex flex-col gap-[5px]">
                <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                  Description
                </span>
                <textarea
                  className="min-h-[80px] border border-current bg-transparent px-[16px] py-[12px] text-[20px] tracking-[-0.009em] outline-none focus:ring-2 focus:ring-accent"
                  name="description"
                />
              </label>
              <label className="flex flex-col gap-[5px]">
                <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                  Accent colour
                </span>
                <input
                  className="h-[48px] border border-current bg-transparent px-[16px] text-[20px] tracking-[-0.009em] outline-none focus:ring-2 focus:ring-accent"
                  defaultValue="#ff0000"
                  name="accentColor"
                  required
                  type="text"
                />
              </label>
              {workspaceError ? (
                <p className="border border-accent bg-accent/10 px-[16px] py-[12px] text-[11px] uppercase tracking-[-0.005em] text-accent">
                  {workspaceError}
                </p>
              ) : null}
              <button
                className="h-[48px] rounded-[300px] bg-white px-[20px] text-[11px] uppercase tracking-[-0.005em] text-black transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60"
                disabled={isCreatingWorkspace}
                type="submit"
              >
                {isCreatingWorkspace ? "Creating…" : "Create workspace"}
              </button>
            </form>
          </div>

          <div className="nfh-panel t-panel-slide" data-open="true">
            <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Pending Invitations
            </p>
            {pendingInvitations.length ? (
              <div className="mt-[10px] flex flex-col gap-[10px]">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between border border-current p-[20px]"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                        {invitation.role}
                      </p>
                      <p className="mt-[5px] text-[20px] font-medium tracking-[-0.009em]">
                        {invitation.workspace.name}
                      </p>
                    </div>
                    <button
                      className="h-[40px] rounded-[300px] bg-white px-[16px] text-[11px] uppercase tracking-[-0.005em] text-black transition-transform hover:scale-[1.02] active:scale-[0.97]"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      type="button"
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-[10px] text-[11px] uppercase tracking-[-0.005em] opacity-60">
                No pending invitations.
              </p>
            )}
          </div>

          {activeMembership?.role === "ADMIN" ? (
            <div className="nfh-panel t-panel-slide" data-open="true">
              <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                Invite Member
              </p>
              <form className="mt-[10px] flex flex-col gap-[10px]" onSubmit={handleSendInvitation}>
                <label className="flex flex-col gap-[5px]">
                  <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                    Email
                  </span>
                  <input
                    className="h-[48px] border border-current bg-transparent px-[16px] text-[20px] tracking-[-0.009em] outline-none focus:ring-2 focus:ring-accent"
                    name="email"
                    required
                    type="email"
                  />
                </label>
                <label className="flex flex-col gap-[5px]">
                  <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                    Role
                  </span>
                  <select
                    className="h-[48px] border border-current bg-transparent px-[16px] text-[20px] tracking-[-0.009em] outline-none focus:ring-2 focus:ring-accent"
                    defaultValue="MEMBER"
                    name="role"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                {invitationError ? (
                  <p className="border border-accent bg-accent/10 px-[16px] py-[12px] text-[11px] uppercase tracking-[-0.005em] text-accent">
                    {invitationError}
                  </p>
                ) : null}
                <button
                  className="h-[48px] rounded-[300px] bg-white px-[20px] text-[11px] uppercase tracking-[-0.005em] text-black transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60"
                  disabled={isSendingInvitation}
                  type="submit"
                >
                  {isSendingInvitation ? "Sending…" : "Send invitation"}
                </button>
              </form>
            </div>
          ) : null}

          <div className="nfh-panel t-panel-slide" data-open="true">
            <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Avatar Upload
            </p>
            <div className="mt-[10px] flex flex-col gap-[10px]">
              {user.avatarUrl ? (
                <Image
                  alt={`${user.displayName || user.email} avatar`}
                  className="h-[96px] w-[96px] border border-current object-cover"
                  src={user.avatarUrl}
                  width={96}
                  height={96}
                />
              ) : null}
              <label className="flex flex-col gap-[5px]">
                <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                  Upload a profile image
                </span>
                <input
                  accept="image/*"
                  className="h-[48px] border border-current bg-transparent px-[16px] text-[11px] uppercase tracking-[-0.005em] file:mr-[10px] file:h-[32px] file:rounded-[300px] file:border-0 file:bg-white file:px-[12px] file:text-[11px] file:uppercase file:tracking-[-0.005em] file:text-black"
                  disabled={isUploadingAvatar}
                  onChange={handleAvatarUpload}
                  type="file"
                />
              </label>
              {avatarError ? (
                <p className="border border-accent bg-accent/10 px-[16px] py-[12px] text-[11px] uppercase tracking-[-0.005em] text-accent">
                  {avatarError}
                </p>
              ) : null}
              <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
                {isUploadingAvatar
                  ? "Uploading avatar…"
                  : "Avatar uploads go straight to Cloudinary when credentials are configured."}
              </p>
            </div>
          </div>

          <PresencePanel activeWorkspace={activeMembership?.workspace || null} onlineUserIds={onlineUserIds} />
          <NotificationsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />
          <GoalsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />
          <AnnouncementsPanel activeMembership={activeMembership || null} refreshKey={realtimeVersion} />
          <ActionItemsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />
          <PermissionsPanel activeMembership={activeMembership || null} />
          <AuditPanel activeMembership={activeMembership || null} refreshKey={realtimeVersion} />
          <AnalyticsPanel activeWorkspace={activeMembership?.workspace || null} refreshKey={realtimeVersion} />
        </div>

        <div className="col-span-12 flex flex-col justify-between nfh-panel-invert t-panel-slide md:col-span-4" data-open="true">
          <div>
            <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Session Controls
            </p>
            <p className="mt-[10px] text-[clamp(1.5rem,4vw,2.5rem)] font-medium leading-[0.95] tracking-[-0.02em]">
              {activeMembership
                ? `${activeMembership.workspace.name} is active.`
                : "Cookie-backed auth is live."}
            </p>
            <p className="mt-[10px] text-[11px] uppercase tracking-[-0.005em] opacity-60">
              {pendingInvitations.length
                ? `${pendingInvitations.length} pending invitation${pendingInvitations.length === 1 ? "" : "s"} waiting.`
                : "No pending invitations right now."}
            </p>
          </div>
          <button
            className="mt-[10px] h-[48px] rounded-[300px] border border-current px-[20px] text-[11px] uppercase tracking-[-0.005em] transition-transform hover:scale-[1.02] active:scale-[0.97]"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </section>
    </main>
  );
}
