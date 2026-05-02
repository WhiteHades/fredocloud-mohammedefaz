"use client";

import { useState } from "react";

import { apiUrl } from "@/lib/runtime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { PermissionsPanel } from "@/components/dashboard/permissions-panel";
import { UploadSimple } from "@phosphor-icons/react";

export function SettingsPanel({
  activeMembership,
  avatarError,
  handleAvatarUpload,
  isUploadingAvatar,
  mergeWorkspaceUpdate,
  setDashboardUser,
  user,
}) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [profileError, setProfileError] = useState("");
  const [profileStatus, setProfileStatus] = useState("idle");
  const [workspaceName, setWorkspaceName] = useState(activeMembership?.workspace.name || "");
  const [workspaceDescription, setWorkspaceDescription] = useState(activeMembership?.workspace.description || "");
  const [accentColor, setAccentColor] = useState(activeMembership?.workspace.accentColor || "#c8102e");
  const [workspaceError, setWorkspaceError] = useState("");
  const [workspaceStatus, setWorkspaceStatus] = useState("idle");

  if (!activeMembership) {
    return null;
  }

  const initials = user.displayName
    ? user.displayName.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  async function handleProfileSave(event) {
    event.preventDefault();
    setProfileStatus("saving");
    setProfileError("");

    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          avatarPublicId: user.avatarPublicId || null,
          avatarUrl: user.avatarUrl || null,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setProfileError(data.error || "Profile update failed.");
        setProfileStatus("idle");
        return;
      }

      setDashboardUser(data.user);
      setProfileStatus("saved");
    } catch {
      setProfileError("Could not update your profile.");
      setProfileStatus("idle");
    }
  }

  async function handleWorkspaceSave(event) {
    event.preventDefault();
    setWorkspaceStatus("saving");
    setWorkspaceError("");

    try {
      const response = await fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: workspaceName,
          description: workspaceDescription,
          accentColor,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setWorkspaceError(data.error || "Workspace update failed.");
        setWorkspaceStatus("idle");
        return;
      }

      mergeWorkspaceUpdate(data.workspace);
      setWorkspaceStatus("saved");
    } catch {
      setWorkspaceError("Could not update workspace settings.");
      setWorkspaceStatus("idle");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Update your display name and avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 rounded-2xl">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.email} />
                  <AvatarFallback className="rounded-2xl text-base">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Badge variant="secondary">{user.email}</Badge>
                  <label className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <UploadSimple /> {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                  </label>
                  {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Display name" />
              </div>
              {profileError && <p className="text-sm text-destructive">{profileError}</p>}
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={profileStatus === "saving"}>
                  {profileStatus === "saving" ? "Saving..." : profileStatus === "saved" ? "Saved" : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Switch between light and dark modes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ThemeToggle align="start" buttonClassName="w-fit" />
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-medium">Current Workspace Accent</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="size-4 rounded-full border border-white/20" style={{ backgroundColor: accentColor }} />
                <code className="text-xs text-muted-foreground">{accentColor}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeMembership.role === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace Settings</CardTitle>
            <CardDescription>Keep the workspace aligned with the assignment brief.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWorkspaceSave} className="grid gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input id="workspaceName" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="workspaceAccent">Accent Colour</Label>
                <Input id="workspaceAccent" type="color" className="h-11 w-full p-1" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} />
              </div>
              <div className="flex flex-col gap-2 lg:col-span-2">
                <Label htmlFor="workspaceDescription">Description</Label>
                <Textarea
                  id="workspaceDescription"
                  value={workspaceDescription}
                  onChange={(event) => setWorkspaceDescription(event.target.value)}
                  rows={3}
                  placeholder="Describe the workspace"
                />
              </div>
              {workspaceError && <p className="text-sm text-destructive lg:col-span-2">{workspaceError}</p>}
              <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                <Button type="submit" disabled={workspaceStatus === "saving"}>
                  {workspaceStatus === "saving" ? "Saving..." : workspaceStatus === "saved" ? "Saved" : "Save Workspace"}
                </Button>
                <Button variant="outline" asChild>
                  <a href={`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/export`} target="_blank" rel="noreferrer">
                    Export Workspace CSV
                  </a>
                </Button>
                <Button variant="ghost" asChild>
                  <a href={`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/audit-events/export`} target="_blank" rel="noreferrer">
                    Export Audit CSV
                  </a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <PermissionsPanel activeMembership={activeMembership} />
    </div>
  );
}
