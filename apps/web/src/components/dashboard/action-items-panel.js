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
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUS_COLUMNS = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

export function ActionItemsPanel({ activeWorkspace, refreshKey }) {
  const [items, setItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("board");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeWorkspace) return;
    setLoading(true);
    Promise.all([
      fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/action-items`, { credentials: "include" }).then((r) => r.json()),
      fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([aiData, goalData]) => {
        setItems(aiData.actionItems || []);
        setGoals(goalData.goals || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
        goalId: fd.get("goalId") || undefined,
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
                  <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ai-date">Due Date</Label>
                <Input id="ai-date" name="dueDate" type="date" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ai-goal">Parent Goal</Label>
                <Select name="goalId">
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {goals.map((g) => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
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
                        </div>
                        <Badge variant={item.priority === "URGENT" ? "destructive" : "secondary"}>{item.priority}</Badge>
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
                      <Badge variant={item.status === "DONE" ? "default" : "secondary"}>{item.status.replace("_", " ")}</Badge>
                      <Badge variant={item.priority === "URGENT" ? "destructive" : "outline"}>{item.priority}</Badge>
                      <span className="font-medium truncate">{item.title}</span>
                    </div>
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
