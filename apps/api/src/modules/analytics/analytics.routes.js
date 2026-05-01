const { Router } = require("express");

const { prisma } = require("../../lib/prisma");
const { getWorkspaceAccess } = require("../../lib/workspace-access");
const { requireAuth } = require("../../middleware/require-auth");

const workspaceAnalyticsRouter = Router({ mergeParams: true });

function getGoalProgress(goal) {
  if (goal.milestones.length) {
    const totalProgress = goal.milestones.reduce(
      (sum, milestone) => sum + milestone.progressPercentage,
      0,
    );

    return Math.round(totalProgress / goal.milestones.length);
  }

  if (goal.status === "COMPLETED") {
    return 100;
  }

  if (goal.status === "IN_PROGRESS") {
    return 50;
  }

  return 0;
}

workspaceAnalyticsRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const [goals, actionItems] = await Promise.all([
    prisma.goal.findMany({
      where: { workspaceId: request.params.workspaceId },
      include: { milestones: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.actionItem.findMany({
      where: { workspaceId: request.params.workspaceId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const completedThisWeek = actionItems.filter(
    (actionItem) =>
      actionItem.status === "DONE" &&
      actionItem.updatedAt >= startOfWeek,
  ).length;
  const overdueCount = actionItems.filter(
    (actionItem) => actionItem.dueDate && actionItem.dueDate < new Date() && actionItem.status !== "DONE",
  ).length;

  return response.status(200).json({
    stats: {
      totalGoals: goals.length,
      itemsCompletedThisWeek: completedThisWeek,
      overdueCount,
    },
    goalCompletion: goals.map((goal) => ({
      goalId: goal.id,
      name: goal.title,
      progress: getGoalProgress(goal),
    })),
  });
});

module.exports = { workspaceAnalyticsRouter };
