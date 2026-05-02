const { Router } = require("express");

const { parseDateValue } = require("../../lib/shared-helpers");
const { recordAuditEvent } = require("../../lib/audit");
const { prisma } = require("../../lib/prisma");
const { emitWorkspaceEvent } = require("../../lib/realtime");
const { getWorkspaceAccess, hasPermission } = require("../../lib/workspace-access");
const { requireAuth } = require("../../middleware/require-auth");

const workspaceActionItemsRouter = Router({ mergeParams: true });
const actionItemActionsRouter = Router();

const ACTION_ITEM_PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

function normalizePriority(priority) {
  if (priority === "URGENT") {
    return "CRITICAL";
  }

  return ACTION_ITEM_PRIORITIES.has(priority) ? priority : "MEDIUM";
}

function serializeActionItem(actionItem) {
  return {
    id: actionItem.id,
    title: actionItem.title,
    description: actionItem.description,
    status: actionItem.status,
    priority: actionItem.priority,
    dueDate: actionItem.dueDate,
    goalId: actionItem.goalId,
    assigneeMembershipId: actionItem.assigneeMembershipId,
    position: actionItem.position,
    createdAt: actionItem.createdAt,
    updatedAt: actionItem.updatedAt,
  };
}

workspaceActionItemsRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const actionItems = await prisma.actionItem.findMany({
    where: { workspaceId: request.params.workspaceId },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  return response.status(200).json({
    actionItems: actionItems.map(serializeActionItem),
  });
});

workspaceActionItemsRouter.post("/", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  if (!hasPermission(membership, "ACTION_ITEM_CREATE")) {
    return response.status(403).json({ error: "This member cannot create action items." });
  }

  const title = typeof request.body.title === "string" ? request.body.title.trim() : "";
  const description =
    typeof request.body.description === "string" && request.body.description.trim()
      ? request.body.description.trim()
      : null;
  const status = request.body.status || "TODO";
  const priority = normalizePriority(request.body.priority);
  const dueDate = parseDateValue(request.body.dueDate);
  const goalId = request.body.goalId || null;
  let assigneeMembershipId = request.body.assigneeMembershipId || membership.id;

  if (!title) {
    return response.status(400).json({ error: "Action item title is required." });
  }

  if (goalId) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });

    if (!goal || goal.workspaceId !== request.params.workspaceId) {
      return response.status(400).json({ error: "Parent goal must belong to this workspace." });
    }
  }

  if (assigneeMembershipId) {
    const requestedAssignee = await prisma.membership.findUnique({
      where: { id: assigneeMembershipId },
    });

    if (!requestedAssignee || requestedAssignee.workspaceId !== request.params.workspaceId) {
      return response.status(400).json({ error: "Assignee must belong to this workspace." });
    }

    assigneeMembershipId = requestedAssignee.id;
  }

  const actionItem = await prisma.actionItem.create({
    data: {
      workspaceId: request.params.workspaceId,
      goalId,
      assigneeMembershipId,
      title,
      description,
      status,
      priority,
      dueDate,
    },
  });

  await recordAuditEvent({
    workspaceId: request.params.workspaceId,
    actorMembershipId: membership.id,
    action: "action_item.created",
    targetType: "action_item",
    targetId: actionItem.id,
    summary: `Created action item ${actionItem.title}`,
  });

  emitWorkspaceEvent(request.params.workspaceId, "action_item:created", {
    workspaceId: request.params.workspaceId,
    actionItem: serializeActionItem(actionItem),
  });

  return response.status(201).json({ actionItem: serializeActionItem(actionItem) });
});

actionItemActionsRouter.patch("/:actionItemId", requireAuth, async (request, response) => {
  const actionItem = await prisma.actionItem.findUnique({
    where: { id: request.params.actionItemId },
  });

  if (!actionItem) {
    return response.status(404).json({ error: "Action item not found." });
  }

  const membership = await getWorkspaceAccess(request.auth.userId, actionItem.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  let nextGoalId = actionItem.goalId;
  if (Object.prototype.hasOwnProperty.call(request.body, "goalId")) {
    nextGoalId = request.body.goalId || null;

    if (nextGoalId) {
      const nextGoal = await prisma.goal.findUnique({ where: { id: nextGoalId } });

      if (!nextGoal || nextGoal.workspaceId !== actionItem.workspaceId) {
        return response.status(400).json({ error: "Parent goal must belong to this workspace." });
      }
    }
  }

  let nextAssigneeMembershipId = actionItem.assigneeMembershipId;
  if (Object.prototype.hasOwnProperty.call(request.body, "assigneeMembershipId")) {
    nextAssigneeMembershipId = request.body.assigneeMembershipId || null;

    if (nextAssigneeMembershipId) {
      const requestedAssignee = await prisma.membership.findUnique({
        where: { id: nextAssigneeMembershipId },
      });

      if (!requestedAssignee || requestedAssignee.workspaceId !== actionItem.workspaceId) {
        return response.status(400).json({ error: "Assignee must belong to this workspace." });
      }
    }
  }

  const updatedActionItem = await prisma.actionItem.update({
    where: { id: actionItem.id },
    data: {
      title:
        typeof request.body.title === "string" && request.body.title.trim()
          ? request.body.title.trim()
          : actionItem.title,
      description:
        typeof request.body.description === "string" && request.body.description.trim()
          ? request.body.description.trim()
          : actionItem.description,
      goalId: nextGoalId,
      assigneeMembershipId: nextAssigneeMembershipId,
      status: request.body.status || actionItem.status,
      priority: normalizePriority(request.body.priority || actionItem.priority),
      dueDate:
        Object.prototype.hasOwnProperty.call(request.body, "dueDate")
          ? parseDateValue(request.body.dueDate)
          : actionItem.dueDate,
      position:
        typeof request.body.position === "number" ? request.body.position : actionItem.position,
    },
  });

  await recordAuditEvent({
    workspaceId: actionItem.workspaceId,
    actorMembershipId: membership.id,
    action: "action_item.updated",
    targetType: "action_item",
    targetId: updatedActionItem.id,
    summary: `Updated action item ${updatedActionItem.title}`,
  });

  emitWorkspaceEvent(actionItem.workspaceId, "action_item:updated", {
    workspaceId: actionItem.workspaceId,
    actionItem: serializeActionItem(updatedActionItem),
  });

  return response.status(200).json({ actionItem: serializeActionItem(updatedActionItem) });
});

module.exports = {
  actionItemActionsRouter,
  workspaceActionItemsRouter,
};
