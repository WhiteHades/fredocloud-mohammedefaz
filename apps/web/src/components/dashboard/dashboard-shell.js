"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Buildings,
  SignOut,
  Plus,
  User,
  UploadSimple,
} from "@phosphor-icons/react";

import { apiUrl } from "@/lib/runtime";
import { apiFetch } from "@/lib/api";
import { NAV_ITEMS } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { DashboardProvider } from "./dashboard-context";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { InviteMemberDialog } from "./invite-member-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";

export function DashboardShell({ children, user, memberships, pendingInvitations }) {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);
  const syncMemberships = useWorkspaceStore((state) => state.syncMemberships);

  const [currentUser, setCurrentUser] = useState(user);
  const [workspaceMemberships, setWorkspaceMemberships] = useState(memberships);
  const [workspaceInvitations, setWorkspaceInvitations] = useState(pendingInvitations);
  const [avatarError, setAvatarError] = useState("");
  const [invitationError, setInvitationError] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [realtimeVersion, setRealtimeVersion] = useState(0);
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [socketToken, setSocketToken] = useState(null);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  function setDashboardUser(nextUser) {
    setCurrentUser(nextUser);
    setUser(nextUser);
  }

  function mergeWorkspaceUpdate(nextWorkspace) {
    setWorkspaceMemberships((prev) => {
      const nextMemberships = prev.map((membership) =>
        membership.workspace.id === nextWorkspace.id
          ? { ...membership, workspace: { ...membership.workspace, ...nextWorkspace } }
          : membership,
      );

      syncMemberships(nextMemberships);
      return nextMemberships;
    });
  }

  useEffect(() => {
    async function syncUserFromProps() {
      setCurrentUser(user);
    }

    void syncUserFromProps();
    setUser(user);
  }, [setUser, user]);

  useEffect(() => {
    async function syncMembershipsFromProps() {
      setWorkspaceMemberships(memberships);
    }

    void syncMembershipsFromProps();
    syncMemberships(memberships);
  }, [memberships, syncMemberships]);

  useEffect(() => {
    async function syncInvitationsFromProps() {
      setWorkspaceInvitations(pendingInvitations);
    }

    void syncInvitationsFromProps();
  }, [pendingInvitations]);

  const activeMembership =
    workspaceMemberships.find(({ workspace }) => workspace.id === activeWorkspaceId) || workspaceMemberships[0] || null;

  async function refreshWorkspaceShell(nextActiveWorkspaceId) {
    const [membershipsResponse, invitationsResponse] = await Promise.all([
      fetch(`${apiUrl}/api/workspaces`, { credentials: "include" }),
      fetch(`${apiUrl}/api/workspaces/invitations`, { credentials: "include" }),
    ]);

    const membershipsData = await membershipsResponse.json().catch(() => ({}));
    const invitationsData = await invitationsResponse.json().catch(() => ({}));

    if (membershipsResponse.ok) {
      const nextMemberships = membershipsData.memberships || [];
      setWorkspaceMemberships(nextMemberships);
      syncMemberships(nextMemberships);

      if (nextActiveWorkspaceId) {
        setActiveWorkspaceId(nextActiveWorkspaceId);
      }
    }

    if (invitationsResponse.ok) {
      setWorkspaceInvitations(invitationsData.invitations || []);
    }
  }

  useEffect(() => {
    async function loadSocketToken() {
      if (!currentUser?.id) {
        setSocketToken(null);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/auth/socket-token`, { credentials: "include" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) { setSocketToken(null); return; }
        setSocketToken(data.socketToken || null);
      } catch { setSocketToken(null); }
    }
    loadSocketToken();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!socketToken) return;
    const socketBaseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || undefined;
    const socket = io(socketBaseUrl, {
      path: "/socket.io",
      auth: { token: socketToken },
      withCredentials: true,
    });
    socket.on("connect", () => {
      if (activeMembership?.workspace.id) {
        socket.emit("workspace:subscribe", { workspaceId: activeMembership.workspace.id });
      }
    });
    socket.on("workspace:presence", ({ workspaceId, onlineUserIds: ids }) => {
      if (workspaceId === activeMembership?.workspace.id) setOnlineUserIds(ids);
    });
    const bumpRealtime = (eventName, payload) => {
      setRealtimeVersion((v) => v + 1);
      setLastRealtimeEvent({ type: eventName, payload });
    };
    [
      "goal:created", "goal:milestone_created", "goal:update_posted",
      "announcement:created", "announcement:updated", "announcement:reaction", "announcement:comment_created",
      "action_item:created", "action_item:updated",
    ].forEach((eventName) => {
      socket.on(eventName, (data) => {
        if (data.workspaceId === activeMembership?.workspace.id) bumpRealtime(eventName, data);
      });
    });
    socket.on("notification:created", (data) => {
      if (data.userId === currentUser.id && data.workspaceId === activeMembership?.workspace.id) bumpRealtime("notification:created", data);
    });
    return () => { socket.disconnect(); };
  }, [activeMembership?.workspace.id, currentUser?.id, socketToken]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch(`${apiUrl}/api/auth/logout`, { method: "POST", credentials: "include" });
    clearUser();
    setCurrentUser(null);
    router.push("/login");
    setIsLoggingOut(false);
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${apiUrl}/api/auth/avatar`, {
        method: "POST", body: formData, credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setAvatarError(data.error || "Avatar upload failed."); return; }
      setDashboardUser(data.user);
    } catch { setAvatarError("Upload failed. Check your connection."); }
    finally {
      event.target.value = "";
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
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          accentColor: formData.get("accentColor"),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setWorkspaceError(data.error || "Workspace creation failed."); return; }
      setActiveWorkspaceId(data.workspace.id);
      startTransition(() => {
        void refreshWorkspaceShell(data.workspace.id);
      });
      setShowCreateWorkspace(false);
      event.currentTarget.reset();
    } catch { setWorkspaceError("Could not reach the server."); }
    finally { setIsCreatingWorkspace(false); }
  }

  async function handleSendInvitation(event) {
    event.preventDefault();
    if (!activeMembership) return;
    setInvitationError("");
    setIsSendingInvitation(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: formData.get("email"), role: formData.get("role") }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setInvitationError(data.error || "Invitation could not be sent."); return; }
      event.currentTarget.reset();
      setShowInviteDialog(false);
    } catch { setInvitationError("Could not reach the server."); }
    finally { setIsSendingInvitation(false); }
  }

  async function handleAcceptInvitation(invitationId) {
    const response = await fetch(`${apiUrl}/api/workspaces/invitations/${invitationId}/accept`, {
      method: "POST", credentials: "include",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setInvitationError(data.error || "Invitation could not be accepted.");
      return;
    }
    const data = await response.json().catch(() => ({}));
    startTransition(() => {
      void refreshWorkspaceShell(data.membership?.workspace?.id);
    });
  }

  const contextValue = {
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
    memberships: workspaceMemberships,
    onlineUserIds,
    pendingInvitations: workspaceInvitations,
    realtimeVersion,
    lastRealtimeEvent,
    refreshWorkspaceShell,
    mergeWorkspaceUpdate,
    setDashboardUser,
    setActiveWorkspaceId,
    user: currentUser,
    workspaceError,
  };

  if (!currentUser) {
    return null;
  }

  const initials = currentUser.displayName
    ? currentUser.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : currentUser.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <DashboardProvider value={contextValue}>
      <SidebarProvider>
        <div className="flex min-h-svh w-full">
          <Sidebar collapsible="icon" side="left" variant="sidebar">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/dashboard">
                    <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                        <span className="text-sm font-bold text-primary-foreground font-heading">nF</span>
                      </div>
                      <span className="text-lg font-semibold font-heading group-data-[collapsible=icon]:hidden">
                        notFredoHub
                      </span>
                    </div>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>

              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full justify-start">
                        <Buildings />
                         <span className="truncate">{activeMembership?.workspace.name || "Select Workspace"}</span>
                         {workspaceMemberships.length > 1 && (
                           <Badge variant="secondary" className="ml-auto">{workspaceMemberships.length}</Badge>
                         )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {workspaceMemberships.map(({ workspace, role }) => (
                        <DropdownMenuItem
                          key={workspace.id}
                          onClick={() => setActiveWorkspaceId(workspace.id)}
                          className={cn(workspace.id === activeWorkspaceId && "bg-muted")}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{workspace.name}</span>
                            <span className="text-xs text-muted-foreground">{role}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowCreateWorkspace(true)}>
                        <Plus /> Create Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            <Separator />

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {NAV_ITEMS.map((item) => {
                      const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                            <Link href={item.href}>
                              <Icon />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup>
                <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {activeMembership?.role === "ADMIN" && (
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setShowInviteDialog(true)}>
                          <User /> Invite Members
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    {workspaceInvitations.length > 0 && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/dashboard/workspaces">
                            <User />
                            <span>Invitations</span>
                            <Badge variant="secondary" className="ml-auto">{workspaceInvitations.length}</Badge>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <Separator />

            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full">
                        <Avatar className="size-6 rounded-md">
                          <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.displayName || currentUser.email} />
                          <AvatarFallback className="rounded-md text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{currentUser.displayName || currentUser.email}</span>
                        <SignOut className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                           <span>{currentUser.displayName}</span>
                           <span className="text-xs text-muted-foreground">{currentUser.email}</span>
                         </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <label className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm">
                          <UploadSimple className="size-4" />
                          {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleAvatarUpload}
                            disabled={isUploadingAvatar}
                          />
                        </label>
                      </DropdownMenuItem>
                      {avatarError && (
                        <DropdownMenuItem disabled className="text-destructive text-xs">{avatarError}</DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                        <SignOut />
                        {isLoggingOut ? "Signing out..." : "Log out"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>

          <main className="flex-1 flex flex-col min-w-0">
            <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur-sm">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mx-1 h-full py-2" />
              <span
                className="size-2.5 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: activeMembership?.workspace.accentColor || "var(--primary)" }}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {activeMembership?.workspace.name || "notFredoHub"}
              </span>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </main>
        </div>

        <CreateWorkspaceDialog
          open={showCreateWorkspace}
          onOpenChange={setShowCreateWorkspace}
          onSubmit={handleCreateWorkspace}
          error={workspaceError}
          isPending={isCreatingWorkspace}
        />

        <InviteMemberDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          onSubmit={handleSendInvitation}
          error={invitationError}
          isPending={isSendingInvitation}
        />
      </SidebarProvider>
    </DashboardProvider>
  );
}
