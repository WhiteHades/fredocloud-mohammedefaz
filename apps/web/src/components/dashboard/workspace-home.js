"use client";

import Image from "next/image";

import { useDashboardContext } from "./dashboard-context";

export function WorkspaceHome() {
  const {
    activeMembership,
    avatarError,
    handleAcceptInvitation,
    handleAvatarUpload,
    handleCreateWorkspace,
    handleSendInvitation,
    invitationError,
    isCreatingWorkspace,
    isSendingInvitation,
    isUploadingAvatar,
    memberships,
    pendingInvitations,
    setActiveWorkspaceId,
    user,
    workspaceError,
  } = useDashboardContext();

  return (
    <div className="grid gap-[10px]">
      <div className="grid gap-[10px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="nfh-subpanel">
          <p className="nfh-eyebrow">Workspace Context</p>
          <h2 className="mt-[5px] text-[clamp(1.5rem,4vw,2.5rem)] leading-[0.95] tracking-[-0.02em]">
            {activeMembership?.workspace.name || "Create your first workspace."}
          </h2>
          <p className="mt-[10px] text-[20px] leading-[1.1] tracking-[-0.009em] opacity-75">
            {activeMembership?.workspace.description || "Pick a workspace to focus the team surface, or create one below."}
          </p>
        </div>

        <div className="grid gap-[10px] md:grid-cols-2 lg:grid-cols-1">
          <div className="nfh-subpanel">
            <p className="nfh-eyebrow">Operator</p>
            <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">{user.displayName || user.email}</p>
            <p className="mt-[10px] nfh-muted">{user.email}</p>
          </div>
          <div className="nfh-subpanel">
            <p className="nfh-eyebrow">Pending Invitations</p>
            <p className="mt-[5px] text-[clamp(2rem,5vw,4rem)] leading-[0.9] tracking-[-0.03em]">{pendingInvitations.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-[10px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
        <div className="nfh-subpanel nfh-stack">
          <p className="nfh-eyebrow">Switch Workspace</p>
          {memberships.length ? (
            memberships.map((membership) => {
              const isActive = membership.workspace.id === activeMembership?.workspace.id;

              return (
                <button
                  key={membership.id}
                  className={`border p-[16px] text-left ${isActive ? "bg-black text-[#e6e6dd]" : ""}`}
                  onClick={() => setActiveWorkspaceId(membership.workspace.id)}
                  type="button"
                >
                  <p className="nfh-eyebrow">{membership.role}</p>
                  <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">{membership.workspace.name}</p>
                  <p className="mt-[10px] nfh-muted">{membership.workspace.description || "No description yet."}</p>
                </button>
              );
            })
          ) : (
            <p className="nfh-muted">No workspaces yet.</p>
          )}
        </div>

        <form className="nfh-subpanel nfh-stack" onSubmit={handleCreateWorkspace}>
          <p className="nfh-eyebrow">Create Workspace</p>
          <label className="nfh-label">
            <span className="nfh-eyebrow">Name</span>
            <input className="nfh-input outline-none focus:ring-2 focus:ring-accent" name="name" required type="text" />
          </label>
          <label className="nfh-label">
            <span className="nfh-eyebrow">Description</span>
            <textarea className="nfh-textarea outline-none focus:ring-2 focus:ring-accent" name="description" />
          </label>
          <label className="nfh-label">
            <span className="nfh-eyebrow">Accent colour</span>
            <input className="nfh-input outline-none focus:ring-2 focus:ring-accent" defaultValue="#ff0000" name="accentColor" required type="text" />
          </label>
          {workspaceError ? <p className="nfh-error">{workspaceError}</p> : null}
          <button className="nfh-pill" disabled={isCreatingWorkspace} type="submit">
            {isCreatingWorkspace ? "Creating…" : "Create workspace"}
          </button>
        </form>

        <div className="nfh-subpanel nfh-stack">
          <p className="nfh-eyebrow">Profile</p>
          {user.avatarUrl ? (
            <Image alt={`${user.displayName || user.email} avatar`} className="h-[112px] w-[112px] border border-current object-cover" src={user.avatarUrl} width={112} height={112} />
          ) : (
            <div className="flex h-[112px] w-[112px] items-center justify-center border border-current text-[11px] uppercase tracking-[-0.005em] opacity-60">
              No avatar
            </div>
          )}
          <label className="nfh-label">
            <span className="nfh-eyebrow">Upload a profile image</span>
            <input
              accept="image/*"
              className="h-[48px] border border-current bg-transparent px-[16px] text-[11px] uppercase tracking-[-0.005em] file:mr-[10px] file:h-[32px] file:rounded-[300px] file:border-0 file:bg-white file:px-[12px] file:text-[11px] file:uppercase file:tracking-[-0.005em] file:text-black"
              disabled={isUploadingAvatar}
              onChange={handleAvatarUpload}
              type="file"
            />
          </label>
          {avatarError ? <p className="nfh-error">{avatarError}</p> : null}
          <p className="nfh-muted">{isUploadingAvatar ? "Uploading avatar…" : "Avatar uploads go straight to Cloudinary when credentials are configured."}</p>
        </div>
      </div>

      <div className="grid gap-[10px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="nfh-subpanel nfh-stack">
          <p className="nfh-eyebrow">Pending Invitations</p>
          {pendingInvitations.length ? (
            pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between border border-current p-[16px]">
                <div>
                  <p className="nfh-eyebrow">{invitation.role}</p>
                  <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">{invitation.workspace.name}</p>
                </div>
                <button className="nfh-pill" onClick={() => handleAcceptInvitation(invitation.id)} type="button">
                  Accept
                </button>
              </div>
            ))
          ) : (
            <p className="nfh-muted">No pending invitations.</p>
          )}
        </div>

        {activeMembership?.role === "ADMIN" ? (
          <form className="nfh-subpanel nfh-stack" onSubmit={handleSendInvitation}>
            <p className="nfh-eyebrow">Invite Member</p>
            <label className="nfh-label">
              <span className="nfh-eyebrow">Email</span>
              <input className="nfh-input outline-none focus:ring-2 focus:ring-accent" name="email" required type="email" />
            </label>
            <label className="nfh-label">
              <span className="nfh-eyebrow">Role</span>
              <select className="nfh-select outline-none focus:ring-2 focus:ring-accent" defaultValue="MEMBER" name="role">
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            {invitationError ? <p className="nfh-error">{invitationError}</p> : null}
            <button className="nfh-pill" disabled={isSendingInvitation} type="submit">
              {isSendingInvitation ? "Sending…" : "Send invitation"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
