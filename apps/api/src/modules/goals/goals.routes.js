const { Router } = require("express");

const { parseDateValue } = require("../../lib/shared-helpers");
const { recordAuditEvent } = require("../../lib/audit");
const { prisma } = require("../../lib/prisma");
const { emitWorkspaceEvent } = require("../../lib/realtime");
const { getWorkspaceAccess, hasPermission } = require("../../lib/workspace-access");
const { requireAuth } = require("../../middleware/require-auth");

const goalsRouter = Router({ mergeParams: true });
const goalDetailRouter = Router();

const GOAL_STATUSES = new Set(["NOT_STARTED", "IN_PROGRESS", "AT_RISK", "COMPLETED", "ARCHIVED"]);

function normalizeGoalStatus(status) {
  if (status === "BLOCKED") {
    return "AT_RISK";
  }

  return GOAL_STATUSES.has(status) ? status : "NOT_STARTED";
}

function serializeGoal(goal) {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    dueDate: goal.dueDate,
    status: goal.status,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    ownerMembershipId: goal.ownerMembershipId,
  };
}

function serializeGoalDetail(goal) {
  return {
    ...serializeGoal(goal),
    milestones: goal.milestones,
    updates: goal.updates,
  };
}

goalsRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const goals = await prisma.goal.findMany({
    where: { workspaceId: request.params.workspaceId },
    orderBy: { createdAt: "asc" },
  });

  return response.status(200).json({ goals: goals.map(serializeGoal) });
});

goalsRouter.post("/", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  if (!hasPermission(membership, "GOAL_CREATE")) {
    return response.status(403).json({ error: "This member cannot create goals." });
  }

  const title = typeof request.body.title === "string" ? request.body.title.trim() : "";
  const description =
    typeof request.body.description === "string" && request.body.description.trim()
      ? request.body.description.trim()
      : null;
  const dueDate = parseDateValue(request.body.dueDate);
  const status = normalizeGoalStatus(request.body.status);
  let ownerMembershipId = membership.id;

  if (!title) {
    return response.status(400).json({ error: "Goal title is required." });
  }

  if (request.body.ownerMembershipId) {
    const requestedOwner = await prisma.membership.findUnique({
      where: { id: request.body.ownerMembershipId },
    });

    if (!requestedOwner || requestedOwner.workspaceId !== request.params.workspaceId) {
      return response.status(400).json({ error: "Goal owner must belong to this workspace." });
    }

    ownerMembershipId = requestedOwner.id;
  }

  const goal = await prisma.goal.create({
    data: {
      workspaceId: request.params.workspaceId,
      ownerMembershipId,
      title,
      description,
      dueDate,
      status,
    },
  });

  await recordAuditEvent({
    workspaceId: request.params.workspaceId,
    actorMembershipId: membership.id,
    action: "goal.created",
    targetType: "goal",
    targetId: goal.id,
    summary: `Created goal ${goal.title}`,
  });

  emitWorkspaceEvent(request.params.workspaceId, "goal:created", {
    workspaceId: request.params.workspaceId,
    goal: serializeGoal(goal),
  });

  return response.status(201).json({ goal: serializeGoal(goal) });
});

async function getGoalContext(goalId) {
  return prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      milestones: {
        orderBy: { createdAt: "asc" },
      },
      updates: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

goalDetailRouter.get("/:goalId", requireAuth, async (request, response) => {
  const goal = await getGoalContext(request.params.goalId);

  if (!goal) {
    return response.status(404).json({ error: "Goal not found." });
  }

  const membership = await getWorkspaceAccess(request.auth.userId, goal.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  return response.status(200).json({ goal: serializeGoalDetail(goal) });
});

goalDetailRouter.post("/:goalId/milestones", requireAuth, async (request, response) => {
  const goal = await getGoalContext(request.params.goalId);

  if (!goal) {
    return response.status(404).json({ error: "Goal not found." });
  }

  const membership = await getWorkspaceAccess(request.auth.userId, goal.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const title = typeof request.body.title === "string" ? request.body.title.trim() : "";
  const progressPercentage = Number(request.body.progressPercentage || 0);
  const dueDate = parseDateValue(request.body.dueDate);

  if (!title) {
    return response.status(400).json({ error: "Milestone title is required." });
  }

  const milestone = await prisma.milestone.create({
    data: {
      goalId: goal.id,
      title,
      progressPercentage,
      dueDate,
    },
  });

  await recordAuditEvent({
    workspaceId: goal.workspaceId,
    actorMembershipId: membership.id,
    action: "milestone.created",
    targetType: "milestone",
    targetId: milestone.id,
    summary: `Added milestone ${milestone.title}`,
  });

  emitWorkspaceEvent(goal.workspaceId, "goal:milestone_created", {
    workspaceId: goal.workspaceId,
    goalId: goal.id,
    milestone,
  });

  return response.status(201).json({ milestone });
});

goalDetailRouter.post("/:goalId/updates", requireAuth, async (request, response) => {
  const goal = await getGoalContext(request.params.goalId);

  if (!goal) {
    return response.status(404).json({ error: "Goal not found." });
  }

  const membership = await getWorkspaceAccess(request.auth.userId, goal.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const content = typeof request.body.content === "string" ? request.body.content.trim() : "";

  if (!content) {
    return response.status(400).json({ error: "Progress update content is required." });
  }

  const update = await prisma.goalUpdate.create({
    data: {
      goalId: goal.id,
      authorMembershipId: membership.id,
      content,
    },
  });

  await recordAuditEvent({
    workspaceId: goal.workspaceId,
    actorMembershipId: membership.id,
    action: "goal.update_posted",
    targetType: "goal_update",
    targetId: update.id,
    summary: `Posted a progress update on ${goal.title}`,
  });

  emitWorkspaceEvent(goal.workspaceId, "goal:update_posted", {
    workspaceId: goal.workspaceId,
    goalId: goal.id,
    update,
  });

  return response.status(201).json({ update });
});

module.exports = { goalsRouter, goalDetailRouter };
