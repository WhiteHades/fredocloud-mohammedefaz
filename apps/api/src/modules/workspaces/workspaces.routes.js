const { Router } = require("express");

const { recordAuditEvent } = require("../../lib/audit");
const { prisma } = require("../../lib/prisma");
const {
  getWorkspaceAccess,
  hasPermission,
  serializePermissions,
} = require("../../lib/workspace-access");
const { requireAuth } = require("../../middleware/require-auth");

const workspacesRouter = Router();

function serializeMembership(membership) {
  return {
    id: membership.id,
    role: membership.role,
    permissions: membership.permissions ? serializePermissions(membership) : undefined,
    user: membership.user
      ? {
          id: membership.user.id,
          email: membership.user.email,
          displayName: membership.user.displayName,
        }
      : undefined,
    workspace: {
      id: membership.workspace.id,
      name: membership.workspace.name,
      description: membership.workspace.description,
      accentColor: membership.workspace.accentColor,
      createdAt: membership.workspace.createdAt,
      updatedAt: membership.workspace.updatedAt,
    },
  };
}

workspacesRouter.get("/", requireAuth, async (request, response) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: request.auth.userId },
    include: { permissions: true, workspace: true },
    orderBy: { createdAt: "asc" },
  });

  return response.status(200).json({
    memberships: memberships.map(serializeMembership),
  });
});

workspacesRouter.post("/", requireAuth, async (request, response) => {
  const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
  const description =
    typeof request.body.description === "string" && request.body.description.trim()
      ? request.body.description.trim()
      : null;
  const accentColor =
    typeof request.body.accentColor === "string" && request.body.accentColor.trim()
      ? request.body.accentColor.trim()
      : "#c8102e";

  if (!name) {
    return response.status(400).json({ error: "Workspace name is required." });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      description,
      accentColor,
      createdById: request.auth.userId,
      memberships: {
        create: {
          userId: request.auth.userId,
          role: "ADMIN",
        },
      },
    },
    include: {
      memberships: {
        include: { workspace: true },
      },
    },
  });

  const membership = workspace.memberships[0];

  await recordAuditEvent({
    workspaceId: workspace.id,
    actorMembershipId: membership.id,
    action: "workspace.created",
    targetType: "workspace",
    targetId: workspace.id,
    summary: `Created workspace ${workspace.name}`,
  });

  return response.status(201).json({
    workspace: serializeMembership(membership).workspace,
    membership: {
      id: membership.id,
      role: membership.role,
    },
  });
});

workspacesRouter.post("/:workspaceId/invitations", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership || !hasPermission(membership, "MEMBER_INVITE")) {
    return response.status(403).json({ error: "Only workspace admins can send invitations." });
  }

  const email = typeof request.body.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const role = request.body.role === "ADMIN" ? "ADMIN" : "MEMBER";

  if (!email) {
    return response.status(400).json({ error: "Invitation email is required." });
  }

  const invitation = await prisma.invitation.create({
    data: {
      email,
      role,
      workspaceId: request.params.workspaceId,
      invitedByMembershipId: membership.id,
    },
  });

  await recordAuditEvent({
    workspaceId: request.params.workspaceId,
    actorMembershipId: membership.id,
    action: "invitation.created",
    targetType: "invitation",
    targetId: invitation.id,
    summary: `Invited ${invitation.email} as ${invitation.role}`,
  });

  return response.status(201).json({ invitation });
});

workspacesRouter.get("/:workspaceId/members", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const memberships = await prisma.membership.findMany({
    where: { workspaceId: request.params.workspaceId },
    include: {
      permissions: true,
      user: true,
      workspace: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return response.status(200).json({
    memberships: memberships.map(serializeMembership),
  });
});

workspacesRouter.get("/invitations", requireAuth, async (request, response) => {
  const user = await prisma.user.findUnique({ where: { id: request.auth.userId } });

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  const invitations = await prisma.invitation.findMany({
    where: {
      email: user.email,
      status: "PENDING",
    },
    include: {
      workspace: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return response.status(200).json({ invitations });
});

workspacesRouter.post("/invitations/:invitationId/accept", requireAuth, async (request, response) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: request.params.invitationId },
  });

  if (!invitation || invitation.status !== "PENDING") {
    return response.status(404).json({ error: "Invitation not found." });
  }

  const user = await prisma.user.findUnique({ where: { id: request.auth.userId } });

  if (!user || user.email !== invitation.email) {
    return response.status(403).json({ error: "This invitation does not belong to the current user." });
  }

  const existingMembership = await getWorkspaceAccess(user.id, invitation.workspaceId);

  if (existingMembership) {
    return response.status(409).json({ error: "This user already belongs to the workspace." });
  }

  const membership = await prisma.membership.create({
    data: {
      userId: user.id,
      workspaceId: invitation.workspaceId,
      role: invitation.role,
    },
    include: {
      workspace: true,
    },
  });

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      status: "ACCEPTED",
    },
  });

  await recordAuditEvent({
    workspaceId: invitation.workspaceId,
    actorMembershipId: membership.id,
    action: "invitation.accepted",
    targetType: "membership",
    targetId: membership.id,
    summary: `${user.email} accepted the invitation`,
  });

  return response.status(200).json({
    membership: {
      id: membership.id,
      role: membership.role,
      workspace: serializeMembership(membership).workspace,
    },
  });
});

workspacesRouter.patch(
  "/:workspaceId/members/:membershipId/permissions",
  requireAuth,
  async (request, response) => {
    const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

    if (!membership || !hasPermission(membership, "WORKSPACE_UPDATE")) {
      return response.status(403).json({ error: "Only workspace admins can update permissions." });
    }

    const permission = typeof request.body.permission === "string" ? request.body.permission.trim() : "";
    const allowed = Boolean(request.body.allowed);

    if (!permission) {
      return response.status(400).json({ error: "Permission name is required." });
    }

    await prisma.membershipPermission.upsert({
      where: {
        membershipId_permission: {
          membershipId: request.params.membershipId,
          permission,
        },
      },
      update: { allowed },
      create: {
        membershipId: request.params.membershipId,
        permission,
        allowed,
      },
    });

    const updatedMembership = await prisma.membership.findUnique({
      where: { id: request.params.membershipId },
      include: {
        permissions: true,
        user: true,
        workspace: true,
      },
    });

    await recordAuditEvent({
      workspaceId: request.params.workspaceId,
      actorMembershipId: membership.id,
      action: "permission.updated",
      targetType: "membership",
      targetId: updatedMembership.id,
      summary: `Updated ${permission} for ${updatedMembership.user.email}`,
      metadata: { permission, allowed },
    });

    return response.status(200).json({ membership: serializeMembership(updatedMembership) });
  },
);

module.exports = { workspacesRouter };
