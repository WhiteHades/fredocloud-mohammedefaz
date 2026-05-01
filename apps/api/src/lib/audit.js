const { prisma } = require("./prisma");

async function recordAuditEvent({
  workspaceId,
  actorMembershipId,
  action,
  targetType,
  targetId,
  summary,
  metadata = null,
}) {
  return prisma.auditEvent.create({
    data: {
      workspaceId,
      actorMembershipId,
      action,
      targetType,
      targetId,
      summary,
      metadata,
    },
  });
}

module.exports = { recordAuditEvent };
