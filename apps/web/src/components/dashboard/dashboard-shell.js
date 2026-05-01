"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  House,
  Buildings,
  Target,
  Megaphone,
  Checks,
  ChartBar,
  ActivityIcon,
  Gear,
  SignOut,
  Plus,
  User,
  UploadSimple,
} from "@phosphor-icons/react";

import { apiUrl } from "@/lib/runtime";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { DashboardProvider } from "./dashboard-context";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AnimeIntro } from "@/components/app-shell/anime-intro";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: House },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: Buildings },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/action-items", label: "Action Items", icon: Checks },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartBar },
  { href: "/dashboard/activity", label: "Activity", icon: ActivityIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Gear },
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
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => { setUser(user); }, [setUser, user]);
  useEffect(() => { syncMemberships(memberships); }, [memberships, syncMemberships]);

  const activeMembership =
    memberships.find(({ workspace }) => workspace.id === activeWorkspaceId) || memberships[0] || null;

  useEffect(() => {
    async function loadSocketToken() {
      try {
        const response = await fetch(`${apiUrl}/api/auth/socket-token`, { credentials: "include" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) { setSocketToken(null); return; }
        setSocketToken(data.socketToken || null);
      } catch { setSocketToken(null); }
    }
    loadSocketToken();
  }, [user.id]);

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
    const bumpRealtime = () => setRealtimeVersion((v) => v + 1);
    [
      "goal:created", "goal:milestone_created", "goal:update_posted",
      "announcement:created", "announcement:updated", "announcement:reaction", "announcement:comment_created",
      "action_item:created", "action_item:updated",
    ].forEach((eventName) => {
      socket.on(eventName, ({ workspaceId }) => {
        if (workspaceId === activeMembership?.workspace.id) bumpRealtime();
      });
    });
    socket.on("notification:created", ({ userId, workspaceId }) => {
      if (userId === user.id && workspaceId === activeMembership?.workspace.id) bumpRealtime();
    });
    return () => { socket.disconnect(); };
  }, [activeMembership?.workspace.id, socketToken, user.id]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch(`${apiUrl}/api/auth/logout`, { method: "POST", credentials: "include" });
    clearUser();
    router.push("/login");
    router.refresh();
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
      setUser(data.user);
      router.refresh();
    } catch { setAvatarError("Upload failed. Check your connection."); }
    finally { setIsUploadingAvatar(false); }
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
      router.refresh();
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
    router.refresh();
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
    router.refresh();
  }

  const contextValue = useMemo(
    () => ({
      activeMembership, avatarError, handleAcceptInvitation, handleAvatarUpload,
      handleCreateWorkspace, handleLogout, handleSendInvitation, invitationError,
      isCreatingWorkspace, isLoggingOut, isSendingInvitation, isUploadingAvatar,
      memberships, onlineUserIds, pendingInvitations, realtimeVersion,
      setActiveWorkspaceId, user, workspaceError,
    }),
    [
      activeMembership, avatarError, invitationError, isCreatingWorkspace,
      isLoggingOut, isSendingInvitation, isUploadingAvatar, memberships,
      onlineUserIds, pendingInvitations, realtimeVersion, setActiveWorkspaceId,
      user, workspaceError,
    ],
  );

  const initials = user.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

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
                        {memberships.length > 1 && (
                          <Badge variant="secondary" className="ml-auto">{memberships.length}</Badge>
                        )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {memberships.map(({ workspace, role }) => (
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
                      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
                    {pendingInvitations.length > 0 && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/dashboard/workspaces">
                            <User />
                            <span>Invitations</span>
                            <Badge variant="secondary" className="ml-auto">{pendingInvitations.length}</Badge>
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
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.email} />
                          <AvatarFallback className="rounded-md text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user.displayName || user.email}</span>
                        <SignOut className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span>{user.displayName}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
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
            <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm font-medium text-muted-foreground">
                {activeMembership?.workspace.name || "notFredoHub"}
              </span>
            </div>
            <AnimeIntro>
              <div className="p-4 md:p-6 lg:p-8" data-anime-item>
                {children}
              </div>
            </AnimeIntro>
          </main>
        </div>

        <Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>Create a new workspace for your team.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Workspace name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Brief description" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <Input id="accentColor" name="accentColor" defaultValue="#d4510a" type="color" className="h-10 w-full p-1" />
              </div>
              {workspaceError && <p className="text-sm text-destructive">{workspaceError}</p>}
              <Button type="submit" disabled={isCreatingWorkspace}>
                {isCreatingWorkspace ? "Creating..." : "Create Workspace"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Member</DialogTitle>
              <DialogDescription>Send an invitation to join this workspace.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendInvitation} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="colleague@example.com" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="MEMBER">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {invitationError && <p className="text-sm text-destructive">{invitationError}</p>}
              <Button type="submit" disabled={isSendingInvitation}>
                {isSendingInvitation ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </DashboardProvider>
  );
}
