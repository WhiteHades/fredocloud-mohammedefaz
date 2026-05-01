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

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "AT_RISK", label: "At Risk" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

function formatLabel(value) {
  return String(value || "").toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function GoalsPanel({ activeMembership, refreshKey }) {
  const activeWorkspace = activeMembership?.workspace || null;
  const [goals, setGoals] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalDetail, setGoalDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeWorkspace) return;
    let cancelled = false;

    async function loadGoals() {
      setLoading(true);

      try {
        const [goalsResponse, membersResponse] = await Promise.all([
          fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, { credentials: "include" }),
          fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/members`, { credentials: "include" }),
        ]);
        const [goalsData, membersData] = await Promise.all([
          goalsResponse.json().catch(() => ({})),
          membersResponse.json().catch(() => ({})),
        ]);

        if (cancelled) {
          return;
        }

        if (goalsResponse.ok) {
          setGoals(goalsData.goals || []);
        }

        if (membersResponse.ok) {
          setMemberships(membersData.memberships || []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGoals();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace, refreshKey]);

  useEffect(() => {
    if (!selectedGoal || !activeWorkspace) return;
    fetch(`${apiUrl}/api/goals/${selectedGoal}`, { credentials: "include" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, data: d })))
      .then(({ ok, data }) => { if (ok) setGoalDetail(data.goal || null); })
      .catch(() => {});
  }, [selectedGoal, activeWorkspace, refreshKey]);

  function handleCreateGoal(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: fd.get("title"),
        description: fd.get("description"),
        dueDate: fd.get("dueDate"),
        status: fd.get("status"),
        ownerMembershipId: fd.get("ownerMembershipId") || activeMembership?.id,
      }),
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
        setGoalDetail((prev) => ({ ...(prev || {}), milestones: [...(prev?.milestones || []), data.milestone] }));
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
        setGoalDetail((prev) => ({ ...(prev || {}), updates: [data.update, ...(prev?.updates || [])] }));
        e.currentTarget.reset();
      })
      .catch(() => setError("Failed to post update."));
  }

  function getMemberLabel(membershipId) {
    const membership = memberships.find((entry) => entry.id === membershipId);
    return membership?.user?.displayName || membership?.user?.email || "Unassigned";
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
                      {STATUS_OPTIONS.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="g-owner">Owner</Label>
                  <Select name="ownerMembershipId" defaultValue={activeMembership?.id || memberships[0]?.id || undefined}>
                    <SelectTrigger id="g-owner"><SelectValue placeholder="Select owner" /></SelectTrigger>
                    <SelectContent>
                      {memberships.map((membership) => (
                        <SelectItem key={membership.id} value={membership.id}>
                          {membership.user.displayName || membership.user.email}
                        </SelectItem>
                      ))}
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
                    <p className="text-xs text-muted-foreground">Owner: {getMemberLabel(goal.ownerMembershipId)}</p>
                    {goal.dueDate && <p className="text-xs text-muted-foreground">Due: {new Date(goal.dueDate).toLocaleDateString()}</p>}
                  </div>
                  <Badge variant="secondary" className="shrink-0">{formatLabel(goal.status)}</Badge>
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
                <CardTitle>{goalDetail.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge>{formatLabel(goalDetail.status)}</Badge>
                  <Badge variant="outline">Owner: {getMemberLabel(goalDetail.ownerMembershipId)}</Badge>
                  {goalDetail.dueDate && (
                    <Badge variant="secondary">Due: {new Date(goalDetail.dueDate).toLocaleDateString()}</Badge>
                  )}
                </div>
              </CardHeader>
              {goalDetail.description && (
                <CardContent><p className="text-sm text-muted-foreground">{goalDetail.description}</p></CardContent>
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
