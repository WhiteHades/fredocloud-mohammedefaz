"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/runtime";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, CheckCircle, Clock, XCircle } from "@phosphor-icons/react";

const STATUS_OPTIONS = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED"];

export function GoalsPanel({ activeWorkspace, refreshKey }) {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalDetail, setGoalDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);
    fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, { credentials: "include" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => { if (ok) setGoals(data.goals || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeWorkspace, refreshKey]);

  useEffect(() => {
    if (!selectedGoal || !activeWorkspace) return;
    fetch(`${apiUrl}/api/goals/${selectedGoal}`, { credentials: "include" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => { if (ok) setGoalDetail(data); })
      .catch(() => {});
  }, [selectedGoal, activeWorkspace, refreshKey]);

  function handleCreateGoal(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: fd.get("title"), description: fd.get("description"), dueDate: fd.get("dueDate"), status: fd.get("status") }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setGoals((prev) => [data.goal, ...prev]);
        setShowCreate(false);
        e.currentTarget.reset();
      })
      .catch(() => setError("Failed to create goal."));
  }

  function handleAddMilestone(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fetch(`${apiUrl}/api/goals/${selectedGoal}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: fd.get("title"), progressPercentage: Number(fd.get("progress")), dueDate: fd.get("dueDate") }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setGoalDetail((prev) => ({ ...prev, milestones: [...(prev?.milestones || []), data.milestone] }));
        e.currentTarget.reset();
      })
      .catch(() => setError("Failed to add milestone."));
  }

  function handlePostUpdate(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fetch(`${apiUrl}/api/goals/${selectedGoal}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: fd.get("content") }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setGoalDetail((prev) => ({ ...prev, updates: [data.update, ...(prev?.updates || [])] }));
        e.currentTarget.reset();
      })
      .catch(() => setError("Failed to post update."));
  }

  if (!activeWorkspace) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold font-heading">Goals</h2>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus /> New Goal
          </Button>
        </div>

        {showCreate && (
          <Card>
            <CardContent className="pt-4">
              <form onSubmit={handleCreateGoal} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="g-title">Title</Label>
                  <Input id="g-title" name="title" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="g-desc">Description</Label>
                  <Textarea id="g-desc" name="description" rows={2} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="g-date">Due Date</Label>
                  <Input id="g-date" name="dueDate" type="date" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="g-status">Status</Label>
                  <Select name="status" defaultValue="NOT_STARTED">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit">Create Goal</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : goals.length === 0 ? (
          <Empty title="No goals yet" description="Create your first goal to get started." />
        ) : (
          goals.map((goal) => (
            <Card
              key={goal.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedGoal === goal.id ? "border-primary ring-1 ring-primary/20" : ""}`}
              onClick={() => setSelectedGoal(goal.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{goal.title}</p>
                    {goal.dueDate && <p className="text-xs text-muted-foreground">Due: {new Date(goal.dueDate).toLocaleDateString()}</p>}
                  </div>
                  <Badge variant="secondary" className="shrink-0">{goal.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="lg:col-span-2">
        {!selectedGoal ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
            <p className="text-muted-foreground">Select a goal to view details</p>
          </div>
        ) : goalDetail ? (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{goalDetail.goal?.title || goalDetail.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge>{goalDetail.goal?.status || goalDetail.status}</Badge>
                  {(goalDetail.goal?.dueDate || goalDetail.dueDate) && (
                    <Badge variant="secondary">Due: {new Date(goalDetail.goal?.dueDate || goalDetail.dueDate).toLocaleDateString()}</Badge>
                  )}
                </div>
              </CardHeader>
              {(goalDetail.goal?.description || goalDetail.description) && (
                <CardContent><p className="text-sm text-muted-foreground">{goalDetail.goal?.description || goalDetail.description}</p></CardContent>
              )}
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Milestones</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                {(goalDetail.milestones || []).map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{m.title}</p>
                      {m.dueDate && <p className="text-xs text-muted-foreground">{new Date(m.dueDate).toLocaleDateString()}</p>}
                    </div>
                    <Badge variant="secondary">{m.progressPercentage}%</Badge>
                  </div>
                ))}
                <Separator />
                <form onSubmit={handleAddMilestone} className="flex flex-col gap-2">
                  <Input name="title" placeholder="Milestone title" required />
                  <div className="flex gap-2">
                    <Input name="progress" type="number" min="0" max="100" defaultValue="0" className="w-24" />
                    <Input name="dueDate" type="date" />
                    <Button type="submit" size="sm"><Plus /></Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Progress Updates</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                <form onSubmit={handlePostUpdate} className="flex flex-col gap-2">
                  <Textarea name="content" placeholder="Post a progress update..." rows={2} required />
                  <Button type="submit" size="sm" className="self-end">Post Update</Button>
                </form>
                {(goalDetail.updates || []).map((u) => (
                  <div key={u.id} className="rounded-lg border p-3">
                    <p className="text-sm">{u.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(u.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center"><Skeleton className="h-8 w-8" /></div>
        )}
      </div>
    </div>
  );
}
