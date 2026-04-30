const { Router } = require("express");

const { prisma } = require("../../lib/prisma");
const { requireAuth } = require("../../middleware/require-auth");

const workspacesRouter = Router();

function serializeMembership(membership) {
  return {
    id: membership.id,
    role: membership.role,
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

async function getMembershipContext(userId, workspaceId) {
  return prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });
}

workspacesRouter.get("/", requireAuth, async (request, response) => {
  const memberships = await prisma.membership.findMany({
    where: { userId: request.auth.userId },
    include: { workspace: true },
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

  return response.status(201).json({
    workspace: serializeMembership(membership).workspace,
    membership: {
      id: membership.id,
      role: membership.role,
    },
  });
});

workspacesRouter.post("/:workspaceId/invitations", requireAuth, async (request, response) => {
  const membership = await getMembershipContext(request.auth.userId, request.params.workspaceId);

  if (!membership || membership.role !== "ADMIN") {
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

  return response.status(201).json({ invitation });
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

  const existingMembership = await getMembershipContext(user.id, invitation.workspaceId);

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

  return response.status(200).json({
    membership: {
      id: membership.id,
      role: membership.role,
      workspace: serializeMembership(membership).workspace,
    },
  });
});

module.exports = { workspacesRouter };
