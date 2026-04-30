const { Router } = require("express");

const { prisma } = require("../../lib/prisma");
const { requireAuth } = require("../../middleware/require-auth");

const workspaceActionItemsRouter = Router({ mergeParams: true });
const actionItemActionsRouter = Router();

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

workspaceActionItemsRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getMembershipContext(request.auth.userId, request.params.workspaceId);

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
  const membership = await getMembershipContext(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const title = typeof request.body.title === "string" ? request.body.title.trim() : "";
  const description =
    typeof request.body.description === "string" && request.body.description.trim()
      ? request.body.description.trim()
      : null;
  const status = request.body.status || "TODO";
  const priority = request.body.priority || "MEDIUM";
  const dueDate = request.body.dueDate ? new Date(request.body.dueDate) : null;
  const goalId = request.body.goalId || null;
  const assigneeMembershipId = request.body.assigneeMembershipId || membership.id;

  if (!title) {
    return response.status(400).json({ error: "Action item title is required." });
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

  return response.status(201).json({ actionItem: serializeActionItem(actionItem) });
});

actionItemActionsRouter.patch("/:actionItemId", requireAuth, async (request, response) => {
  const actionItem = await prisma.actionItem.findUnique({
    where: { id: request.params.actionItemId },
  });

  if (!actionItem) {
    return response.status(404).json({ error: "Action item not found." });
  }

  const membership = await getMembershipContext(request.auth.userId, actionItem.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
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
      status: request.body.status || actionItem.status,
      priority: request.body.priority || actionItem.priority,
      dueDate: request.body.dueDate ? new Date(request.body.dueDate) : actionItem.dueDate,
      position:
        typeof request.body.position === "number" ? request.body.position : actionItem.position,
    },
  });

  return response.status(200).json({ actionItem: serializeActionItem(updatedActionItem) });
});

module.exports = {
  actionItemActionsRouter,
  workspaceActionItemsRouter,
};
