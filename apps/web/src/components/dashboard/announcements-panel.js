"use client";

import { useEffect, useState, useRef } from "react";
import { apiUrl } from "@/lib/runtime";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Megaphone, PushPin, Chat, Fire, HandHeart, CheckFat, ThumbsUp } from "@phosphor-icons/react";
import { RichTextField } from "./rich-text-field";

const EMOJI_REACTIONS = ["🔥", "👏", "✅", "📌"];

export function AnnouncementsPanel({ activeMembership, lastRealtimeEvent }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");
  const pendingReactionsRef = useRef({});

  useEffect(() => {
    if (!activeMembership) return;
    let cancelled = false;

    async function loadAnnouncements() {
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/announcements`, { credentials: "include" });
        const data = await response.json().catch(() => ({}));

        if (!cancelled && response.ok) {
          setAnnouncements(data.announcements || []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAnnouncements();

    return () => {
      cancelled = true;
    };
  }, [activeMembership]);

  useEffect(() => {
    if (!lastRealtimeEvent || lastRealtimeEvent.type !== "announcement:reaction") return;
    const { announcementId, reactions } = lastRealtimeEvent.payload || {};
    if (!announcementId || !reactions) return;

    const hasPendingReaction = Object.keys(pendingReactionsRef.current).some(
      (key) => key.startsWith(`${announcementId}:`)
    );
    if (hasPendingReaction) return;

    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcementId ? { ...a, reactions } : a))
    );
  }, [lastRealtimeEvent]);

  function handlePublish(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const attachment = fd.get("attachment");

    setError("");
    setIsPublishing(true);

    fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: fd.get("title"), content: fd.get("content"), pinned: fd.get("pinned") === "on" }),
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(async ({ ok, data }) => {
        if (!ok) {
          setError(data.error || "Failed to publish.");
          return;
        }

        let nextAnnouncement = data.announcement;

        if (attachment instanceof File && attachment.size > 0) {
          const attachmentFormData = new FormData();
          attachmentFormData.append("file", attachment);

          const attachmentResponse = await fetch(`${apiUrl}/api/announcements/${data.announcement.id}/attachments`, {
            method: "POST",
            body: attachmentFormData,
            credentials: "include",
          });
          const attachmentData = await attachmentResponse.json().catch(() => ({}));

          if (!attachmentResponse.ok) {
            setError(attachmentData.error || "Announcement published, but the attachment upload failed.");
          } else {
            nextAnnouncement = attachmentData.announcement || nextAnnouncement;
          }
        }

        setAnnouncements((prev) => [nextAnnouncement, ...prev]);
        e.currentTarget.reset();
      })
      .catch(() => setError("Failed to publish."))
      .finally(() => setIsPublishing(false));
  }

  function handleTogglePin(id) {
    fetch(`${apiUrl}/api/announcements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ pinned: !announcements.find((a) => a.id === id)?.pinned }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
        );
      });
  }

  function handleReaction(announcementId, emoji) {
    const key = `${announcementId}:${emoji}`;
    if (pendingReactionsRef.current[key]) return;
    pendingReactionsRef.current[key] = true;

    const prevAnnouncements = announcements;
    const ann = announcements.find((a) => a.id === announcementId);
    if (!ann) { delete pendingReactionsRef.current[key]; return; }

    const existingReactions = ann.reactions || [];
    const myReaction = existingReactions.find(
      (r) => r.emoji === emoji && r.member?.id === activeMembership?.user?.id
    );

    const optimisticReactions = myReaction
      ? existingReactions.filter((r) => r.id !== myReaction.id)
      : [
          ...existingReactions,
          {
            id: `optimistic_${key}_${Date.now()}`,
            emoji,
            createdAt: new Date().toISOString(),
            member: {
              id: activeMembership?.user?.id,
              displayName: activeMembership?.user?.displayName,
              email: activeMembership?.user?.email,
            },
          },
        ];

    setAnnouncements((prev) =>
      prev.map((a) => (a.id === announcementId ? { ...a, reactions: optimisticReactions } : a))
    );

    fetch(`${apiUrl}/api/announcements/${announcementId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emoji }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setAnnouncements(prevAnnouncements);
          return;
        }
        if (data.reactions) {
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === announcementId ? { ...a, reactions: data.reactions } : a))
          );
        }
      })
      .catch(() => {
        setAnnouncements(prevAnnouncements);
      })
      .finally(() => {
        delete pendingReactionsRef.current[key];
      });
  }

  function handleComment(e, announcementId) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fetch(`${apiUrl}/api/announcements/${announcementId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: fd.get("content") }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === announcementId ? { ...a, comments: [...(a.comments || []), data.comment] } : a))
        );
        e.currentTarget.reset();
      });
  }

  const sorted = [...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  if (!activeMembership) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h2 className="text-lg font-semibold font-heading">Announcements</h2>
        {loading ? (
          <div className="flex flex-col gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
        ) : sorted.length === 0 ? (
          <Empty title="No announcements yet" description="Admins can publish announcements to the workspace." />
        ) : (
          sorted.map((ann) => (
            <Card key={ann.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {ann.pinned && <PushPin className="size-4 text-primary" />}
                      <CardTitle className="text-base">{ann.title}</CardTitle>
                    </div>
                    <CardDescription>{new Date(ann.createdAt).toLocaleString()}</CardDescription>
                  </div>
                  {activeMembership.role === "ADMIN" && (
                    <Button variant="ghost" size="icon" onClick={() => handleTogglePin(ann.id)} title={ann.pinned ? "Unpin" : "Pin"}>
                      <PushPin className={ann.pinned ? "text-primary" : ""} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: ann.content }} />
                {ann.attachments?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ann.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                      >
                        {attachment.filename}
                      </a>
                    ))}
                  </div>
                ) : null}
                <Separator className="my-3" />
                <div className="flex items-center gap-2 flex-wrap">
                  {EMOJI_REACTIONS.map((emoji) => {
                    const reactions = ann.reactions || [];
                    const count = reactions.filter((r) => r.emoji === emoji).length;
                    const reactedBy = reactions
                      .filter((r) => r.emoji === emoji)
                      .map((r) => r.member?.displayName || r.member?.email?.split("@")[0] || "Someone");

                    return (
                      <Tooltip key={emoji}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(ann.id, emoji)}
                            className="text-base min-w-[44px] min-h-[44px] hover:bg-accent"
                          >
                            {emoji}
                            {count > 0 && <span className="ml-1 text-xs tabular-nums">{count}</span>}
                          </Button>
                        </TooltipTrigger>
                        {count > 0 && (
                          <TooltipContent side="top" className="max-w-[200px] text-xs">
                            <p className="font-medium mb-0.5">{emoji}</p>
                            <p className="text-muted-foreground">{reactedBy.join(", ")}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {(ann.comments || []).map((c) => (
                    <div key={c.id} className="rounded-lg bg-muted/50 p-2">
                      <p className="text-sm">{c.content}</p>
                      <p className="text-xs text-muted-foreground">{c.author?.displayName || "User"} · {new Date(c.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                  <form onSubmit={(e) => handleComment(e, ann.id)} className="flex flex-wrap gap-2">
                    <Input name="content" placeholder="Add a comment..." required className="h-9 min-w-0 flex-1" />
                    <Button type="submit" size="sm" className="min-w-[44px]"><Chat /></Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {activeMembership.role === "ADMIN" && (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish Announcement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePublish} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="a-title">Title</Label>
                  <Input id="a-title" name="title" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="a-content">Content</Label>
                  <RichTextField name="content" label="Content" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="a-pinned" name="pinned" />
                  <Label htmlFor="a-pinned">Pin immediately</Label>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="a-attachment">Attachment</Label>
                  <Input id="a-attachment" name="attachment" type="file" />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={isPublishing}>
                  <Megaphone /> {isPublishing ? "Publishing..." : "Publish"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
