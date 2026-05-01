const { Router } = require("express");

const { prisma } = require("../../lib/prisma");
const { getWorkspaceAccess } = require("../../lib/workspace-access");
const { requireAuth } = require("../../middleware/require-auth");

const workspaceNotificationsRouter = Router({ mergeParams: true });

workspaceNotificationsRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const notifications = await prisma.notification.findMany({
    where: {
      workspaceId: request.params.workspaceId,
      userId: request.auth.userId,
    },
    orderBy: { createdAt: "desc" },
  });

  return response.status(200).json({ notifications });
});

module.exports = { workspaceNotificationsRouter };
