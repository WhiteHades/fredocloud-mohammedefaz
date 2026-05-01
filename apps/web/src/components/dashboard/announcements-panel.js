"use client";

import { useEffect, useState } from "react";
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
import { Megaphone, PushPin, Chat, Fire, HandHeart, CheckFat, ThumbsUp } from "@phosphor-icons/react";
import { RichTextField } from "./rich-text-field";

const EMOJI_REACTIONS = ["🔥", "👏", "✅", "📌"];

export function AnnouncementsPanel({ activeMembership, refreshKey }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeMembership) return;
    setLoading(true);
    fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/announcements`, { credentials: "include" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => { if (ok) setAnnouncements(data.announcements || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeMembership, refreshKey]);

  function handlePublish(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fetch(`${apiUrl}/api/workspaces/${activeMembership.workspace.id}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: fd.get("title"), content: fd.get("content"), pinned: fd.get("pinned") === "on" }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setAnnouncements((prev) => [data.announcement, ...prev]);
        e.currentTarget.reset();
      })
      .catch(() => setError("Failed to publish."));
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

  function handleReaction(id, emoji) {
    fetch(`${apiUrl}/api/announcements/${id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emoji }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, reactions: data.reactions } : a)));
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
                <Separator className="my-3" />
                <div className="flex items-center gap-2 flex-wrap">
                  {EMOJI_REACTIONS.map((emoji) => {
                    const count = (ann.reactions || []).filter((r) => r.emoji === emoji).length;
                    return (
                      <Button key={emoji} variant="ghost" size="sm" onClick={() => handleReaction(ann.id, emoji)} className="text-base">
                        {emoji} {count > 0 && <span className="ml-1 text-xs">{count}</span>}
                      </Button>
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
                  <form onSubmit={(e) => handleComment(e, ann.id)} className="flex gap-2">
                    <Input name="content" placeholder="Add a comment..." required className="h-9" />
                    <Button type="submit" size="sm"><Chat /></Button>
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
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit"><Megaphone /> Publish</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
