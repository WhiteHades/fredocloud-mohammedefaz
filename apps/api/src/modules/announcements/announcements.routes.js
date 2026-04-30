const { Router } = require("express");

const { prisma } = require("../../lib/prisma");
const { requireAuth } = require("../../middleware/require-auth");

const workspaceAnnouncementsRouter = Router({ mergeParams: true });
const announcementActionsRouter = Router();

function serializeAnnouncement(announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    pinned: announcement.pinned,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
    comments: announcement.comments,
    reactions: announcement.reactions,
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

async function getAnnouncementContext(announcementId) {
  return prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
      reactions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

workspaceAnnouncementsRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getMembershipContext(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const announcements = await prisma.announcement.findMany({
    where: { workspaceId: request.params.workspaceId },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
      reactions: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return response.status(200).json({
    announcements: announcements.map(serializeAnnouncement),
  });
});

workspaceAnnouncementsRouter.post("/", requireAuth, async (request, response) => {
  const membership = await getMembershipContext(request.auth.userId, request.params.workspaceId);

  if (!membership || membership.role !== "ADMIN") {
    return response.status(403).json({ error: "Only workspace admins can publish announcements." });
  }

  const title = typeof request.body.title === "string" ? request.body.title.trim() : "";
  const content = typeof request.body.content === "string" ? request.body.content.trim() : "";
  const pinned = Boolean(request.body.pinned);

  if (!title || !content) {
    return response.status(400).json({ error: "Announcement title and content are required." });
  }

  const announcement = await prisma.announcement.create({
    data: {
      workspaceId: request.params.workspaceId,
      authorMembershipId: membership.id,
      title,
      content,
      pinned,
    },
    include: {
      comments: true,
      reactions: true,
    },
  });

  return response.status(201).json({ announcement: serializeAnnouncement(announcement) });
});

announcementActionsRouter.post("/:announcementId/reactions", requireAuth, async (request, response) => {
  const announcement = await getAnnouncementContext(request.params.announcementId);

  if (!announcement) {
    return response.status(404).json({ error: "Announcement not found." });
  }

  const membership = await getMembershipContext(request.auth.userId, announcement.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const emoji = typeof request.body.emoji === "string" ? request.body.emoji.trim() : "";

  if (!emoji) {
    return response.status(400).json({ error: "Reaction emoji is required." });
  }

  const existingReaction = await prisma.announcementReaction.findUnique({
    where: {
      announcementId_membershipId_emoji: {
        announcementId: announcement.id,
        membershipId: membership.id,
        emoji,
      },
    },
  });

  if (existingReaction) {
    await prisma.announcementReaction.delete({ where: { id: existingReaction.id } });
    return response.status(200).json({ reacted: false });
  }

  await prisma.announcementReaction.create({
    data: {
      announcementId: announcement.id,
      membershipId: membership.id,
      emoji,
    },
  });

  return response.status(200).json({ reacted: true });
});

announcementActionsRouter.patch("/:announcementId", requireAuth, async (request, response) => {
  const announcement = await getAnnouncementContext(request.params.announcementId);

  if (!announcement) {
    return response.status(404).json({ error: "Announcement not found." });
  }

  const membership = await getMembershipContext(request.auth.userId, announcement.workspaceId);

  if (!membership || membership.role !== "ADMIN") {
    return response.status(403).json({ error: "Only workspace admins can update announcements." });
  }

  const nextPinnedState = typeof request.body.pinned === "boolean" ? request.body.pinned : announcement.pinned;
  const nextTitle = typeof request.body.title === "string" && request.body.title.trim() ? request.body.title.trim() : announcement.title;
  const nextContent = typeof request.body.content === "string" && request.body.content.trim() ? request.body.content.trim() : announcement.content;

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id: announcement.id },
    data: {
      pinned: nextPinnedState,
      title: nextTitle,
      content: nextContent,
    },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
      reactions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return response.status(200).json({ announcement: serializeAnnouncement(updatedAnnouncement) });
});

announcementActionsRouter.post("/:announcementId/comments", requireAuth, async (request, response) => {
  const announcement = await getAnnouncementContext(request.params.announcementId);

  if (!announcement) {
    return response.status(404).json({ error: "Announcement not found." });
  }

  const membership = await getMembershipContext(request.auth.userId, announcement.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const content = typeof request.body.content === "string" ? request.body.content.trim() : "";

  if (!content) {
    return response.status(400).json({ error: "Comment content is required." });
  }

  const comment = await prisma.announcementComment.create({
    data: {
      announcementId: announcement.id,
      authorMembershipId: membership.id,
      content,
    },
  });

  return response.status(201).json({ comment });
});

module.exports = {
  announcementActionsRouter,
  workspaceAnnouncementsRouter,
};
