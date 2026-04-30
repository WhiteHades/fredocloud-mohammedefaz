-- CreateEnum
CREATE TYPE "ActionItemStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "ActionItemPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "goalId" TEXT,
    "assigneeMembershipId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ActionItemStatus" NOT NULL DEFAULT 'TODO',
    "priority" "ActionItemPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_assigneeMembershipId_fkey" FOREIGN KEY ("assigneeMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
