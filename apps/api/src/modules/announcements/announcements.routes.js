const { Router } = require("express");
const multer = require("multer");

const { recordAuditEvent } = require("../../lib/audit");
const { sendMentionEmail } = require("../../lib/email");
const { hasCloudinaryConfig, uploadAssetBuffer } = require("../../lib/cloudinary");
const { prisma } = require("../../lib/prisma");
const { config } = require("../../lib/env");
const { emitNotificationEvent, emitWorkspaceEvent } = require("../../lib/realtime");
const { getWorkspaceAccess, hasPermission } = require("../../lib/workspace-access");
const { requireAuth } = require("../../middleware/require-auth");

const workspaceAnnouncementsRouter = Router({ mergeParams: true });
const announcementActionsRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

function serializeAnnouncementComment(comment) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.authorMembership?.user
      ? {
          id: comment.authorMembership.user.id,
          email: comment.authorMembership.user.email,
          displayName: comment.authorMembership.user.displayName,
        }
      : null,
  };
}

function serializeAnnouncementReactions(reactions) {
  return (reactions || []).map((reaction) => ({
    id: reaction.id,
    emoji: reaction.emoji,
    createdAt: reaction.createdAt,
    member: reaction.membership?.user
      ? {
          id: reaction.membership.user.id,
          displayName: reaction.membership.user.displayName,
          email: reaction.membership.user.email,
        }
      : null,
  }));
}

function serializeAnnouncement(announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    pinned: announcement.pinned,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
    comments: (announcement.comments || []).map(serializeAnnouncementComment),
    reactions: serializeAnnouncementReactions(announcement.reactions),
    attachments: announcement.attachments || [],
  };
}

async function getAnnouncementContext(announcementId) {
  return prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      comments: {
        include: {
          authorMembership: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: {
        include: {
          membership: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      attachments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

function extractMentionHandles(content) {
  return [...content.matchAll(/(^|\s)@([a-z0-9._-]+)/gi)].map((match) => match[2].toLowerCase());
}

workspaceAnnouncementsRouter.get("/", requireAuth, async (request, response) => {
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  const announcements = await prisma.announcement.findMany({
    where: { workspaceId: request.params.workspaceId },
    include: {
      comments: {
        include: {
          authorMembership: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: {
        include: {
          membership: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      attachments: {
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
  const membership = await getWorkspaceAccess(request.auth.userId, request.params.workspaceId);

  if (!membership || !hasPermission(membership, "ANNOUNCEMENT_PUBLISH")) {
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
      comments: {
        include: {
          authorMembership: {
            include: { user: true },
          },
        },
      },
      reactions: {
        include: {
          membership: {
            include: { user: true },
          },
        },
      },
      attachments: true,
    },
  });

  await recordAuditEvent({
    workspaceId: request.params.workspaceId,
    actorMembershipId: membership.id,
    action: "announcement.created",
    targetType: "announcement",
    targetId: announcement.id,
    summary: `Published announcement ${announcement.title}`,
  });

  emitWorkspaceEvent(request.params.workspaceId, "announcement:created", {
    workspaceId: request.params.workspaceId,
    announcement: serializeAnnouncement(announcement),
  });

  return response.status(201).json({ announcement: serializeAnnouncement(announcement) });
});

announcementActionsRouter.post("/:announcementId/reactions", requireAuth, async (request, response) => {
  const announcement = await getAnnouncementContext(request.params.announcementId);

  if (!announcement) {
    return response.status(404).json({ error: "Announcement not found." });
  }

  const membership = await getWorkspaceAccess(request.auth.userId, announcement.workspaceId);

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
    const fresh = await getAnnouncementContext(announcement.id);
    emitWorkspaceEvent(announcement.workspaceId, "announcement:reaction", {
      workspaceId: announcement.workspaceId,
      announcementId: announcement.id,
      reactions: serializeAnnouncementReactions(fresh.reactions),
    });
    return response.status(200).json({ reactions: serializeAnnouncementReactions(fresh.reactions) });
  }

  await prisma.announcementReaction.create({
    data: {
      announcementId: announcement.id,
      membershipId: membership.id,
      emoji,
    },
  });

  const freshAnnouncement = await getAnnouncementContext(announcement.id);

  emitWorkspaceEvent(announcement.workspaceId, "announcement:reaction", {
    workspaceId: announcement.workspaceId,
    announcementId: announcement.id,
    reactions: serializeAnnouncementReactions(freshAnnouncement.reactions),
  });

  return response.status(200).json({ reactions: serializeAnnouncementReactions(freshAnnouncement.reactions) });
});

announcementActionsRouter.patch("/:announcementId", requireAuth, async (request, response) => {
  const announcement = await getAnnouncementContext(request.params.announcementId);

  if (!announcement) {
    return response.status(404).json({ error: "Announcement not found." });
  }

  const membership = await getWorkspaceAccess(request.auth.userId, announcement.workspaceId);

  if (!membership || !hasPermission(membership, "ANNOUNCEMENT_PUBLISH")) {
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
        include: {
          authorMembership: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: {
        include: {
          membership: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      attachments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  await recordAuditEvent({
    workspaceId: announcement.workspaceId,
    actorMembershipId: membership.id,
    action: "announcement.updated",
    targetType: "announcement",
    targetId: announcement.id,
    summary: `${nextPinnedState ? "Pinned" : "Updated"} announcement ${updatedAnnouncement.title}`,
  });

  emitWorkspaceEvent(announcement.workspaceId, "announcement:updated", {
    workspaceId: announcement.workspaceId,
    announcement: serializeAnnouncement(updatedAnnouncement),
  });

  return response.status(200).json({ announcement: serializeAnnouncement(updatedAnnouncement) });
});

announcementActionsRouter.post("/:announcementId/attachments", requireAuth, upload.single("file"), async (request, response) => {
  const announcement = await getAnnouncementContext(request.params.announcementId);

  if (!announcement) {
    return response.status(404).json({ error: "Announcement not found." });
  }

  const membership = await getWorkspaceAccess(request.auth.userId, announcement.workspaceId);

  if (!membership) {
    return response.status(403).json({ error: "Workspace membership is required." });
  }

  if (!hasCloudinaryConfig) {
    return response.status(503).json({ error: "Cloudinary credentials are not configured for this environment." });
  }

  if (!request.file) {
    return response.status(400).json({ error: "Attachment file is required." });
  }

  const uploadResult = await uploadAssetBuffer(request.file.buffer, {
    folder: "notfredohub/attachments",
    public_id: `announcement_${announcement.id}_${Date.now()}`,
    overwrite: true,
    resource_type: "auto",
  });

  const attachment = await prisma.announcementAttachment.create({
    data: {
      announcementId: announcement.id,
      filename: request.file.originalname,
      mimeType: request.file.mimetype,
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      bytes: request.file.size,
    },
  });

  const updatedAnnouncement = await getAnnouncementContext(announcement.id);

  await recordAuditEvent({
    workspaceId: announcement.workspaceId,
    actorMembershipId: membership.id,
    action: "announcement.attachment_added",
    targetType: "announcement_attachment",
    targetId: attachment.id,
    summary: `Added attachment ${attachment.filename} to ${announcement.title}`,
  });

  emitWorkspaceEvent(announcement.workspaceId, "announcement:updated", {
    workspaceId: announcement.workspaceId,
    announcement: serializeAnnouncement(updatedAnnouncement),
  });

  return response.status(201).json({
    attachment,
    announcement: serializeAnnouncement(updatedAnnouncement),
  });
});

announcementActionsRouter.post("/:announcementId/comments", requireAuth, async (request, response) => {
  const announcement = await getAnnouncementContext(request.params.announcementId);

  if (!announcement) {
    return response.status(404).json({ error: "Announcement not found." });
  }

  const membership = await getWorkspaceAccess(request.auth.userId, announcement.workspaceId);

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
    include: {
      authorMembership: {
        include: { user: true },
      },
    },
  });

  await recordAuditEvent({
    workspaceId: announcement.workspaceId,
    actorMembershipId: membership.id,
    action: "announcement.comment_created",
    targetType: "announcement_comment",
    targetId: comment.id,
    summary: `Commented on announcement ${announcement.title}`,
  });

  const mentionHandles = [...new Set(extractMentionHandles(content))];

  if (mentionHandles.length) {
    const workspaceMemberships = await prisma.membership.findMany({
      where: { workspaceId: announcement.workspaceId },
      include: { user: true },
    });

    const mentionedMemberships = workspaceMemberships.filter((workspaceMembership) => {
      const localPart = workspaceMembership.user.email.split("@")[0]?.toLowerCase();

      return (
        workspaceMembership.id !== membership.id &&
        mentionHandles.includes(localPart)
      );
    });

    if (mentionedMemberships.length) {
      await prisma.notification.createMany({
        data: mentionedMemberships.map((mentionedMembership) => ({
          workspaceId: announcement.workspaceId,
          userId: mentionedMembership.userId,
          type: "MENTION",
          title: `Mentioned in ${announcement.title}`,
          body: content,
          link: `/dashboard?announcement=${announcement.id}`,
          metadata: {
            announcementId: announcement.id,
            commentId: comment.id,
          },
        })),
      });

      mentionedMemberships.forEach((mentionedMembership) => {
        emitNotificationEvent(mentionedMembership.userId, {
          workspaceId: announcement.workspaceId,
          type: "MENTION",
          title: `Mentioned in ${announcement.title}`,
          body: content,
          link: `/dashboard?announcement=${announcement.id}`,
        });
      });

      Promise.all(
        mentionedMemberships.map((mentionedMembership) =>
          sendMentionEmail({
            to: mentionedMembership.user.email,
            workspaceName: membership.workspace.name,
            announcementTitle: announcement.title,
            commentBody: content,
            goUrl: `${config.clientUrl}/dashboard?announcement=${announcement.id}`,
          }).catch((error) => console.error("Mention email failed:", error)),
        ),
      );
    }
  }

  emitWorkspaceEvent(announcement.workspaceId, "announcement:comment_created", {
    workspaceId: announcement.workspaceId,
    announcementId: announcement.id,
    comment: serializeAnnouncementComment(comment),
  });

  return response.status(201).json({ comment: serializeAnnouncementComment(comment) });
});

module.exports = {
  announcementActionsRouter,
  workspaceAnnouncementsRouter,
};
