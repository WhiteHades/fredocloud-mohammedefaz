"use client";

import { useDashboardContext } from "./dashboard-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Empty } from "@/components/ui/empty";
import { Check, Buildings, EnvelopeSimple, UserPlus, UploadSimple, X } from "@phosphor-icons/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function WorkspaceHome() {
  const ctx = useDashboardContext();
  const router = useRouter();
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");

  const fileNameFromUrl = ctx.user.avatarUrl ? ctx.user.avatarUrl.split("/").pop()?.split("?")[0] : null;
  const initials = ctx.user.displayName
    ? ctx.user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : ctx.user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {ctx.activeMembership?.workspace.name || "No workspace selected"}
            </CardTitle>
            <CardDescription>
              {ctx.activeMembership?.workspace.description || "Select or create a workspace to get started."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{ctx.activeMembership?.role || "Guest"}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="size-12 rounded-xl">
              <AvatarImage src={ctx.user.avatarUrl || undefined} />
              <AvatarFallback className="rounded-xl text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{ctx.user.displayName || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">{ctx.user.email}</p>
            </div>
            <label className="ml-auto cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <UploadSimple /> {ctx.isUploadingAvatar ? "Uploading..." : "Avatar"}
                </span>
              </Button>
              <input type="file" accept="image/*" className="sr-only" onChange={ctx.handleAvatarUpload} disabled={ctx.isUploadingAvatar} />
            </label>
            {ctx.avatarError && <p className="text-xs text-destructive mt-1">{ctx.avatarError}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Invitations</CardTitle>
            <CardDescription>{ctx.pendingInvitations.length} pending</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {ctx.pendingInvitations.length === 0 ? (
              <Empty title="No pending invitations" description="Invitations you receive will appear here." />
            ) : (
              ctx.pendingInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{inv.workspace.name}</p>
                    <p className="text-xs text-muted-foreground">{inv.role}</p>
                  </div>
                  <Button size="sm" onClick={() => ctx.handleAcceptInvitation(inv.id)}>
                    <Check /> Accept
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Workspaces</CardTitle>
            <CardDescription>Switch between your team workspaces.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {ctx.memberships.map(({ workspace, role }) => (
              <div
                key={workspace.id}
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted ${workspace.id === ctx.activeMembership?.workspace.id ? "border-primary/50 bg-primary/5" : ""}`}
                onClick={() => ctx.setActiveWorkspaceId(workspace.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Buildings className="size-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{workspace.name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
                <Badge variant={workspace.id === ctx.activeMembership?.workspace.id ? "default" : "secondary"} className="shrink-0">
                  {workspace.id === ctx.activeMembership?.workspace.id ? "Active" : "Switch"}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="mt-2" onClick={() => { setCreateWorkspaceOpen(true); setInviteOpen(false); }}>
              <Buildings /> Create Workspace
            </Button>
          </CardContent>
        </Card>

        {ctx.activeMembership?.role === "ADMIN" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invite Team Members</CardTitle>
              <CardDescription>Invite colleagues to this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ctx.handleSendInvitation(e);
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder="colleague@example.com"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invite-role-select">Role</Label>
                  <Select name="role" defaultValue="MEMBER">
                    <SelectTrigger id="invite-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {ctx.invitationError && <p className="text-sm text-destructive">{ctx.invitationError}</p>}
                <Button type="submit" disabled={ctx.isSendingInvitation}>
                  <EnvelopeSimple /> {ctx.isSendingInvitation ? "Sending..." : "Send Invitation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {createWorkspaceOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Create Workspace</CardTitle>
              <CardDescription>Set up a new workspace for your team.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCreateWorkspaceOpen(false)}>
              <X />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { ctx.handleCreateWorkspace(e); setCreateWorkspaceOpen(false); }} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ws-name">Name</Label>
                <Input id="ws-name" name="name" required placeholder="Workspace name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ws-desc">Description</Label>
                <Input id="ws-desc" name="description" placeholder="Brief description" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="ws-color">Accent Color</Label>
                <Input id="ws-color" name="accentColor" defaultValue="#d4510a" type="color" className="h-10 w-full p-1" />
              </div>
              {ctx.workspaceError && <p className="text-sm text-destructive">{ctx.workspaceError}</p>}
              <Button type="submit" disabled={ctx.isCreatingWorkspace}>
                {ctx.isCreatingWorkspace ? "Creating..." : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
