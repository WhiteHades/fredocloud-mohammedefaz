-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorMembershipId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorMembershipId_fkey" FOREIGN KEY ("actorMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
