const { Router } = require("express");

const { prisma } = require("../../lib/prisma");
const { getWorkspaceAccess, hasPermission } = require("../../lib/workspace-access");
const { requireAuth } = require("../../middleware/require-auth");

const workspaceAuditRouter = Router({ mergeParams: true });

workspaceAuditRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership || !hasPermission(membership, "AUDIT_VIEW")) {
    return response.status(403).json({ error: "This member cannot view audit events." });
  }

  const auditEvents = await prisma.auditEvent.findMany({
    where: { workspaceId: request.params.workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return response.status(200).json({ auditEvents });
});

workspaceAuditRouter.get("/export", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership || !hasPermission(membership, "AUDIT_VIEW")) {
    return response.status(403).json({ error: "This member cannot export audit events." });
  }

  const auditEvents = await prisma.auditEvent.findMany({
    where: { workspaceId: request.params.workspaceId },
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    "action,targetType,targetId,summary,createdAt",
    ...auditEvents.map((event) =>
      [event.action, event.targetType, event.targetId, event.summary, event.createdAt.toISOString()]
        .map((value) => `\"${String(value).replaceAll('"', '""')}\"`)
        .join(","),
    ),
  ];

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", 'attachment; filename="audit-events.csv"');
  return response.status(200).send(rows.join("\n"));
});

module.exports = { workspaceAuditRouter };
