const { prisma } = require("./prisma");

const DEFAULT_ROLE_PERMISSIONS = {
  ADMIN: {
    GOAL_CREATE: true,
    ACTION_ITEM_CREATE: true,
    ANNOUNCEMENT_PUBLISH: true,
    MEMBER_INVITE: true,
    WORKSPACE_UPDATE: true,
    AUDIT_VIEW: true,
  },
  MEMBER: {
    GOAL_CREATE: true,
    ACTION_ITEM_CREATE: true,
    ANNOUNCEMENT_PUBLISH: false,
    MEMBER_INVITE: false,
    WORKSPACE_UPDATE: false,
    AUDIT_VIEW: false,
  },
};

async function getWorkspaceAccess(userId, workspaceId) {
  return prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    include: {
      permissions: true,
      user: true,
    },
  });
}

function hasPermission(membership, permission) {
  const override = membership.permissions.find((entry) => entry.permission === permission);

  if (override) {
    return override.allowed;
  }

  return DEFAULT_ROLE_PERMISSIONS[membership.role]?.[permission] || false;
}

function serializePermissions(membership) {
  return Object.fromEntries(
    Object.keys(DEFAULT_ROLE_PERMISSIONS.ADMIN).map((permission) => [
      permission,
      hasPermission(membership, permission),
    ]),
  );
}

module.exports = {
  DEFAULT_ROLE_PERMISSIONS,
  getWorkspaceAccess,
  hasPermission,
  serializePermissions,
};
