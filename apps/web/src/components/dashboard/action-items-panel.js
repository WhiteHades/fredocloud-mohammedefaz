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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Empty } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ListBullets, Kanban } from "@phosphor-icons/react";

const STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Urgent" },
];
const STATUS_COLUMNS = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

function formatPriority(priority) {
  return PRIORITIES.find((option) => option.value === priority)?.label || priority;
}

function formatStatus(status) {
  return String(status || "").replaceAll("_", " ");
}

export function ActionItemsPanel({ activeMembership, refreshKey }) {
  const activeWorkspace = activeMembership?.workspace || null;
  const [items, setItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("board");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeWorkspace) return;
    let cancelled = false;

    async function loadActionItems() {
      setLoading(true);

      try {
        const [itemsResponse, goalsResponse, membersResponse] = await Promise.all([
          fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/action-items`, { credentials: "include" }),
          fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, { credentials: "include" }),
          fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/members`, { credentials: "include" }),
        ]);
        const [itemsData, goalsData, membersData] = await Promise.all([
          itemsResponse.json().catch(() => ({})),
          goalsResponse.json().catch(() => ({})),
          membersResponse.json().catch(() => ({})),
        ]);

        if (cancelled) {
          return;
        }

        if (itemsResponse.ok) {
          setItems(itemsData.actionItems || []);
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

    void loadActionItems();

    return () => {
      cancelled = true;
    };
  }, [activeWorkspace, refreshKey]);

  function handleStatusChange(itemId, newStatus) {
    fetch(`${apiUrl}/api/action-items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i)));
      });
  }

  function handleCreate(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/action-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          status: fd.get("status"),
          priority: fd.get("priority"),
          dueDate: fd.get("dueDate") || undefined,
          goalId: fd.get("goalId") === "none" ? undefined : fd.get("goalId") || undefined,
          assigneeMembershipId: fd.get("assigneeMembershipId") || activeMembership?.id,
        }),
      })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setItems((prev) => [data.actionItem, ...prev]);
        setShowCreate(false);
        e.currentTarget.reset();
      })
      .catch(() => setError("Failed to create."));
  }

  const getGoalTitle = (goalId) => goals.find((g) => g.id === goalId)?.title || "";
  const getAssigneeLabel = (membershipId) => memberships.find((membership) => membership.id === membershipId)?.user?.displayName || memberships.find((membership) => membership.id === membershipId)?.user?.email || "Unassigned";

  if (!activeWorkspace) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-heading">Action Items</h2>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="board"><Kanban /> Board</TabsTrigger>
              <TabsTrigger value="list"><ListBullets /> List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}><Plus /> New</Button>
        </div>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ai-title">Title</Label>
                <Input id="ai-title" name="title" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ai-status">Status</Label>
                <Select name="status" defaultValue="TODO">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-priority">Priority</Label>
                  <Select name="priority" defaultValue="MEDIUM">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ai-date">Due Date</Label>
                <Input id="ai-date" name="dueDate" type="date" />
              </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-goal">Parent Goal</Label>
                  <Select name="goalId" defaultValue="none">
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {goals.map((g) => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ai-assignee">Assignee</Label>
                  <Select name="assigneeMembershipId" defaultValue={activeMembership?.id || memberships[0]?.id || undefined}>
                    <SelectTrigger id="ai-assignee"><SelectValue placeholder="Select assignee" /></SelectTrigger>
                    <SelectContent>
                      {memberships.map((membership) => (
                        <SelectItem key={membership.id} value={membership.id}>
                          {membership.user.displayName || membership.user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label htmlFor="ai-desc">Description</Label>
                <Textarea id="ai-desc" name="description" rows={2} />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                {error && <p className="text-sm text-destructive mr-auto">{error}</p>}
                <Button type="submit">Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((status) => {
            const columnItems = items.filter((i) => i.status === status);
            return (
              <div key={status} className="rounded-xl border bg-muted/30 p-3 flex flex-col gap-2 min-h-[200px]">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{status.replace("_", " ")}</Badge>
                  <span className="text-xs text-muted-foreground">{columnItems.length}</span>
                </div>
                {columnItems.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {item.goalId && <p className="text-xs text-muted-foreground">{getGoalTitle(item.goalId)}</p>}
                          <p className="text-xs text-muted-foreground">Assignee: {getAssigneeLabel(item.assigneeMembershipId)}</p>
                        </div>
                        <Badge variant={item.priority === "CRITICAL" ? "destructive" : "secondary"}>{formatPriority(item.priority)}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {STATUSES.filter((s) => s !== status).map((s) => (
                          <Button key={s} variant="ghost" size="xs" className="h-6 text-xs" onClick={() => handleStatusChange(item.id, s)}>
                            → {s.replace("_", " ")}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.length === 0 ? (
            <Empty title="No action items" description="Create your first action item." />
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === "DONE" ? "default" : "secondary"}>{formatStatus(item.status)}</Badge>
                      <Badge variant={item.priority === "CRITICAL" ? "destructive" : "outline"}>{formatPriority(item.priority)}</Badge>
                      <span className="font-medium truncate">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Assignee: {getAssigneeLabel(item.assigneeMembershipId)}</p>
                    {item.dueDate && <p className="text-xs text-muted-foreground mt-1">Due: {new Date(item.dueDate).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {STATUSES.map((s) => (
                      item.status !== s && (
                        <Button key={s} variant="ghost" size="xs" className="h-7 text-xs" onClick={() => handleStatusChange(item.id, s)}>
                          {s.replace("_", " ")}
                        </Button>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
