const { Router } = require("express");

const { parseDateString, toCsvCell } = require("@notfredohub/shared");
const { recordAuditEvent } = require("../../lib/audit");
const { config } = require("../../lib/env");
const { sendInvitationEmail } = require("../../lib/email");
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

  await sendInvitationEmail({
    to: invitation.email,
    workspaceName: membership.workspace.name,
    inviterName: membership.user.displayName || membership.user.email,
    acceptUrl: `${config.clientUrl}/dashboard`,
  });

  return response.status(201).json({ invitation });
});

workspacesRouter.patch("/:workspaceId", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership || !hasPermission(membership, "WORKSPACE_UPDATE")) {
    return response.status(403).json({ error: "Only workspace admins can update workspace details." });
  }

  const nextName = typeof request.body.name === "string" ? request.body.name.trim() : membership.workspace.name;
  const nextDescription =
    typeof request.body.description === "string"
      ? request.body.description.trim() || null
      : membership.workspace.description;
  const nextAccentColor =
    typeof request.body.accentColor === "string" && request.body.accentColor.trim()
      ? request.body.accentColor.trim()
      : membership.workspace.accentColor;

  if (!nextName) {
    return response.status(400).json({ error: "Workspace name is required." });
  }

  const workspace = await prisma.workspace.update({
    where: { id: request.params.workspaceId },
    data: {
      name: nextName,
      description: nextDescription,
      accentColor: nextAccentColor,
    },
  });

  await recordAuditEvent({
    workspaceId: workspace.id,
    actorMembershipId: membership.id,
    action: "workspace.updated",
    targetType: "workspace",
    targetId: workspace.id,
    summary: `Updated workspace ${workspace.name}`,
    metadata: {
      name: workspace.name,
      description: workspace.description,
      accentColor: workspace.accentColor,
    },
  });

  return response.status(200).json({
    workspace: {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      accentColor: workspace.accentColor,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    },
  });
});

workspacesRouter.get("/:workspaceId/export", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const [workspace, memberships, goals, announcements, actionItems] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: request.params.workspaceId } }),
    prisma.membership.findMany({
      where: { workspaceId: request.params.workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.goal.findMany({
      where: { workspaceId: request.params.workspaceId },
      include: {
        ownerMembership: { include: { user: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.announcement.findMany({
      where: { workspaceId: request.params.workspaceId },
      include: {
        authorMembership: { include: { user: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.actionItem.findMany({
      where: { workspaceId: request.params.workspaceId },
      include: {
        assigneeMembership: { include: { user: true } },
        goal: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!workspace) {
    return response.status(404).json({ error: "Workspace not found." });
  }

  const rows = [
    [
      "kind",
      "id",
      "title",
      "status",
      "priority",
      "owner",
      "assignee",
      "email",
      "pinned",
      "dueDate",
      "createdAt",
      "updatedAt",
      "notes",
    ].map(toCsvCell).join(","),
    [
      "workspace",
      workspace.id,
      workspace.name,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      parseDateString(workspace.createdAt),
      parseDateString(workspace.updatedAt),
      workspace.description || "",
    ].map(toCsvCell).join(","),
    ...memberships.map((entry) => [
      "membership",
      entry.id,
      entry.user.displayName || entry.user.email,
      entry.role,
      "",
      "",
      "",
      entry.user.email,
      "",
      "",
      parseDateString(entry.createdAt),
      parseDateString(entry.updatedAt),
      "",
    ].map(toCsvCell).join(",")),
    ...goals.map((goal) => [
      "goal",
      goal.id,
      goal.title,
      goal.status,
      "",
      goal.ownerMembership.user.displayName || goal.ownerMembership.user.email,
      "",
      goal.ownerMembership.user.email,
      "",
      parseDateString(goal.dueDate),
      parseDateString(goal.createdAt),
      parseDateString(goal.updatedAt),
      goal.description || "",
    ].map(toCsvCell).join(",")),
    ...announcements.map((announcement) => [
      "announcement",
      announcement.id,
      announcement.title,
      "",
      "",
      announcement.authorMembership.user.displayName || announcement.authorMembership.user.email,
      "",
      announcement.authorMembership.user.email,
      announcement.pinned ? "yes" : "no",
      "",
      parseDateString(announcement.createdAt),
      parseDateString(announcement.updatedAt),
      announcement.content,
    ].map(toCsvCell).join(",")),
    ...actionItems.map((actionItem) => [
      "action_item",
      actionItem.id,
      actionItem.title,
      actionItem.status,
      actionItem.priority,
      actionItem.goal?.title || "",
      actionItem.assigneeMembership?.user?.displayName || actionItem.assigneeMembership?.user?.email || "",
      actionItem.assigneeMembership?.user?.email || "",
      "",
      parseDateString(actionItem.dueDate),
      parseDateString(actionItem.createdAt),
      parseDateString(actionItem.updatedAt),
      actionItem.description || "",
    ].map(toCsvCell).join(",")),
  ];

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="workspace-${workspace.id}.csv"`,
  );
  return response.status(200).send(rows.join("\n"));
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
