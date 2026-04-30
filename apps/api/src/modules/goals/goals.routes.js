const { Router } = require("express");

const { prisma } = require("../../lib/prisma");
const { requireAuth } = require("../../middleware/require-auth");

const goalsRouter = Router({ mergeParams: true });

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

goalsRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getMembershipContext(request.auth.userId, request.params.workspaceId);

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
  const membership = await getMembershipContext(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const title = typeof request.body.title === "string" ? request.body.title.trim() : "";
  const description =
    typeof request.body.description === "string" && request.body.description.trim()
      ? request.body.description.trim()
      : null;
  const dueDate = request.body.dueDate ? new Date(request.body.dueDate) : null;
  const status = request.body.status || "NOT_STARTED";

  if (!title) {
    return response.status(400).json({ error: "Goal title is required." });
  }

  const goal = await prisma.goal.create({
    data: {
      workspaceId: request.params.workspaceId,
      ownerMembershipId: membership.id,
      title,
      description,
      dueDate,
      status,
    },
  });

  return response.status(201).json({ goal: serializeGoal(goal) });
});

module.exports = { goalsRouter };
