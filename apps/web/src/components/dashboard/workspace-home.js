"use client";

import { useDashboardContext } from "./dashboard-context";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { InviteMemberDialog } from "./invite-member-dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Empty } from "@/components/ui/empty";
import { Check, Buildings, EnvelopeSimple, UploadSimple } from "@phosphor-icons/react";
import { useState } from "react";

export function WorkspaceHome() {
  const ctx = useDashboardContext();
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

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
            <div className="flex gap-2 mt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateWorkspaceOpen(true)}>
                <Buildings /> Create Workspace
              </Button>
              {ctx.activeMembership?.role === "ADMIN" && (
                <Button variant="outline" className="flex-1" onClick={() => setInviteOpen(true)}>
                  <EnvelopeSimple /> Invite Members
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Keep your workspace organised.</p>
          </CardContent>
        </Card>
      </div>

      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
        onSubmit={ctx.handleCreateWorkspace}
        error={ctx.workspaceError}
        isPending={ctx.isCreatingWorkspace}
      />

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={ctx.handleSendInvitation}
        error={ctx.invitationError}
        isPending={ctx.isSendingInvitation}
      />
    </div>
  );
}
