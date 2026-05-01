"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

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
    <div className="mt-10 border border-stone-200 p-4 dark:border-stone-800">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
        Announcements
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="border border-stone-200 p-4 dark:border-stone-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                    {announcement.pinned ? "Pinned" : "Workspace-wide"}
                  </p>
                  <h2 className="mt-3 text-2xl font-light tracking-tight text-balance">
                    {announcement.title}
                  </h2>
                </div>
                {activeMembership?.role === "ADMIN" ? (
                  <button
                    className="min-h-[44px] border border-stone-300 px-3 py-2 text-xs uppercase tracking-[0.2em] transition hover:bg-stone-900 hover:text-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-700 dark:hover:bg-stone-50 dark:hover:text-stone-950 dark:focus-visible:ring-stone-50"
                    onClick={() => handleTogglePin(announcement.id, announcement.pinned)}
                    type="button"
                  >
                    {announcement.pinned ? "Unpin" : "Pin"}
                  </button>
                ) : null}
              </div>
              <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-stone-900/70 dark:text-stone-50/70">
                {announcement.content}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["🔥", "👏", "✅", "📌"].map((emoji) => (
                  <button
                    key={emoji}
                    className="min-h-[44px] border border-stone-300 px-3 py-2 text-sm transition hover:bg-stone-900 hover:text-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-700 dark:hover:bg-stone-50 dark:hover:text-stone-950 dark:focus-visible:ring-stone-50"
                    onClick={() => handleReaction(announcement.id, emoji)}
                    type="button"
                  >
                    {emoji} {announcement.reactions.filter((reaction) => reaction.emoji === emoji).length}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3">
                {announcement.comments.length ? (
                  announcement.comments.map((comment) => (
                    <div key={comment.id} className="border border-stone-200 px-3 py-3 dark:border-stone-800">
                      <p className="text-sm leading-relaxed text-stone-900 dark:text-stone-50">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-stone-900/60 dark:text-stone-50/60">No comments yet.</p>
                )}
              </div>
              <form className="mt-4 grid gap-3" onSubmit={(event) => handleComment(event, announcement.id)}>
                <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
                  Add comment
                  <textarea
                    className="min-h-[88px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                    name="content"
                    required
                  />
                </label>
                <button
                  className="min-h-[44px] border border-stone-900 px-4 py-3 text-sm uppercase tracking-[0.22em] transition hover:bg-stone-900 hover:text-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-50 dark:hover:bg-stone-50 dark:hover:text-stone-950 dark:focus-visible:ring-stone-50"
                  disabled={isCommentingId === announcement.id}
                  type="submit"
                >
                  {isCommentingId === announcement.id ? "Posting…" : "Post comment"}
                </button>
              </form>
            </article>
          ))}
          {isLoadingAnnouncements ? (
            <p className="text-sm text-stone-900/60 dark:text-stone-50/60">Loading announcements…</p>
          ) : null}
          {!isLoadingAnnouncements && announcements.length === 0 ? (
            <p className="text-sm text-stone-900/60 dark:text-stone-50/60">
              No announcements yet.
            </p>
          ) : null}
        </div>
        {activeMembership?.role === "ADMIN" ? (
          <form className="grid gap-4 border border-stone-200 p-4 dark:border-stone-800" onSubmit={handleCreateAnnouncement}>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
              Publish Announcement
            </p>
            <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
              Title
              <input
                className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                name="title"
                required
                type="text"
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
              Content
              <textarea
                className="min-h-[160px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                name="content"
                required
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-stone-900/70 dark:text-stone-50/70">
              <input name="pinned" type="checkbox" />
              Pin immediately
            </label>
            {announcementError ? (
              <p className="border border-[#c8102e]/20 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#9d1028] dark:text-[#ff8c9d]">
                {announcementError}
              </p>
            ) : null}
            <button
              className="min-h-[44px] border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.22em] text-stone-50 transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950 dark:hover:bg-stone-200 dark:focus-visible:ring-stone-50"
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
