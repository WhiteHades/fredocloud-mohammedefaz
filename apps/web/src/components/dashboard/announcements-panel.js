"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";
import { RichTextField } from "./rich-text-field";

export function AnnouncementsPanel({ activeMembership, refreshKey }) {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementError, setAnnouncementError] = useState("");
  const [isCommentingId, setIsCommentingId] = useState(null);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  useEffect(() => {
    async function loadAnnouncements() {
      if (!activeMembership) {
        setAnnouncements([]);
        return;
      }

      setAnnouncementError("");
      setIsLoadingAnnouncements(true);

      const response = await fetch(
        `${apiUrl}/api/workspaces/${activeMembership.workspace.id}/announcements`,
        {
          credentials: "include",
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAnnouncementError(data.error || "Announcements could not be loaded.");
        setAnnouncements([]);
        setIsLoadingAnnouncements(false);
        return;
      }

      setAnnouncements(data.announcements);
      setIsLoadingAnnouncements(false);
    }

    loadAnnouncements();
  }, [activeMembership, refreshKey]);

  async function handleCreateAnnouncement(event) {
    event.preventDefault();

    if (!activeMembership) {
      return;
    }

    setAnnouncementError("");
    setIsCreatingAnnouncement(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(
      `${apiUrl}/api/workspaces/${activeMembership.workspace.id}/announcements`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
          pinned: formData.get("pinned") === "on",
        }),
      },
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setAnnouncementError(data.error || "Announcement creation failed.");
      setIsCreatingAnnouncement(false);
      return;
    }

    setAnnouncements((currentAnnouncements) => [data.announcement, ...currentAnnouncements]);
    event.currentTarget.reset();
    setIsCreatingAnnouncement(false);
  }

  async function handleTogglePin(announcementId, pinned) {
    const response = await fetch(`${apiUrl}/api/announcements/${announcementId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ pinned: !pinned }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setAnnouncementError(data.error || "Pin update failed.");
      return;
    }

    setAnnouncements((currentAnnouncements) =>
      currentAnnouncements
        .map((announcement) =>
          announcement.id === announcementId ? data.announcement : announcement,
        )
        .sort((left, right) => Number(right.pinned) - Number(left.pinned)),
    );
  }

  async function handleReaction(announcementId, emoji) {
    const response = await fetch(`${apiUrl}/api/announcements/${announcementId}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ emoji }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setAnnouncementError(data.error || "Reaction could not be saved.");
      return;
    }

    setAnnouncements((currentAnnouncements) =>
      currentAnnouncements.map((announcement) => {
        if (announcement.id !== announcementId) {
          return announcement;
        }

        return {
          ...announcement,
          reactions: data.reacted
            ? [...announcement.reactions, { id: `${announcementId}-${emoji}`, emoji }]
            : announcement.reactions.filter((reaction) => reaction.emoji !== emoji),
        };
      }),
    );
  }

  async function handleComment(event, announcementId) {
    event.preventDefault();

    setAnnouncementError("");
    setIsCommentingId(announcementId);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${apiUrl}/api/announcements/${announcementId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ content: formData.get("content") }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setAnnouncementError(data.error || "Comment could not be posted.");
      setIsCommentingId(null);
      return;
    }

    setAnnouncements((currentAnnouncements) =>
      currentAnnouncements.map((announcement) =>
        announcement.id === announcementId
          ? { ...announcement, comments: [...announcement.comments, data.comment] }
          : announcement,
      ),
    );
    event.currentTarget.reset();
    setIsCommentingId(null);
  }

  return (
    <div className="nfh-panel t-panel-slide" data-open="true">
      <p className="nfh-eyebrow">Announcements</p>
      <div className="mt-[10px] grid gap-[10px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-[10px]">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="nfh-subpanel">
              <div className="flex items-start justify-between gap-[10px]">
                <div>
                  <p className="nfh-eyebrow">
                    {announcement.pinned ? "Pinned" : "Workspace-wide"}
                  </p>
                  <h2 className="mt-[5px] text-[clamp(1.5rem,4vw,2.25rem)] leading-[0.95] tracking-[-0.02em]">
                    {announcement.title}
                  </h2>
                </div>
                {activeMembership?.role === "ADMIN" ? (
                  <button
                    className="nfh-chip"
                    onClick={() => handleTogglePin(announcement.id, announcement.pinned)}
                    type="button"
                  >
                    {announcement.pinned ? "Unpin" : "Pin"}
                  </button>
                ) : null}
              </div>
              <div className="mt-[10px] max-w-[70ch] text-[20px] leading-[1.1] tracking-[-0.009em] opacity-75">
                <span dangerouslySetInnerHTML={{ __html: announcement.content }} />
              </div>
              <div className="mt-[10px] flex flex-wrap gap-[10px]">
                {["🔥", "👏", "✅", "📌"].map((emoji) => (
                  <button
                    key={emoji}
                    className="nfh-chip"
                    onClick={() => handleReaction(announcement.id, emoji)}
                    type="button"
                  >
                    {emoji} {announcement.reactions.filter((reaction) => reaction.emoji === emoji).length}
                  </button>
                ))}
              </div>
              <div className="mt-[10px] grid gap-[10px]">
                {announcement.comments.length ? (
                  announcement.comments.map((comment) => (
                    <div key={comment.id} className="border border-current px-[16px] py-[14px]">
                      <p className="text-[20px] leading-[1.1] tracking-[-0.009em]">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="nfh-muted">No comments yet.</p>
                )}
              </div>
              <form className="mt-[10px] nfh-stack" onSubmit={(event) => handleComment(event, announcement.id)}>
                <label className="nfh-label">
                  <span className="nfh-eyebrow">Add comment</span>
                  <textarea
                    className="nfh-textarea outline-none focus:ring-2 focus:ring-accent"
                    name="content"
                    required
                  />
                </label>
                <button
                  className="nfh-pill"
                  disabled={isCommentingId === announcement.id}
                  type="submit"
                >
                  {isCommentingId === announcement.id ? "Posting…" : "Post comment"}
                </button>
              </form>
            </article>
          ))}
          {isLoadingAnnouncements ? (
            <p className="nfh-muted">Loading announcements…</p>
          ) : null}
          {!isLoadingAnnouncements && announcements.length === 0 ? (
            <p className="nfh-muted">No announcements yet.</p>
          ) : null}
        </div>
        {activeMembership?.role === "ADMIN" ? (
          <form className="nfh-subpanel nfh-stack" onSubmit={handleCreateAnnouncement}>
            <p className="nfh-eyebrow">Publish Announcement</p>
            <label className="nfh-label">
              <span className="nfh-eyebrow">Title</span>
              <input
                className="nfh-input outline-none focus:ring-2 focus:ring-accent"
                name="title"
                required
                type="text"
              />
            </label>
            <RichTextField label="Content" name="content" />
            <label className="flex items-center gap-[10px] text-[11px] uppercase tracking-[-0.005em] opacity-70">
              <input name="pinned" type="checkbox" />
              Pin immediately
            </label>
            {announcementError ? <p className="nfh-error">{announcementError}</p> : null}
            <button
              className="nfh-pill"
              disabled={isCreatingAnnouncement}
              type="submit"
            >
              {isCreatingAnnouncement ? "Publishing…" : "Publish"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
