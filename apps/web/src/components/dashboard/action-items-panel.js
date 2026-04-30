"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

export function ActionItemsPanel({ activeWorkspace }) {
  const [actionItemError, setActionItemError] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isCreatingActionItem, setIsCreatingActionItem] = useState(false);
  const [isLoadingActionItems, setIsLoadingActionItems] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    async function loadPanelData() {
      if (!activeWorkspace) {
        setActionItems([]);
        setGoals([]);
        return;
      }

      setActionItemError("");
      setIsLoadingActionItems(true);

      const [actionItemsResponse, goalsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/action-items`, {
          credentials: "include",
        }),
        fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, {
          credentials: "include",
        }),
      ]);
      const actionItemsData = await actionItemsResponse.json().catch(() => ({}));
      const goalsData = await goalsResponse.json().catch(() => ({}));

      if (!actionItemsResponse.ok) {
        setActionItemError(actionItemsData.error || "Action items could not be loaded.");
        setActionItems([]);
        setIsLoadingActionItems(false);
        return;
      }

      setActionItems(actionItemsData.actionItems || []);
      setGoals(goalsData.goals || []);
      setIsLoadingActionItems(false);
    }

    loadPanelData();
  }, [activeWorkspace]);

  async function handleCreateActionItem(event) {
    event.preventDefault();

    if (!activeWorkspace) {
      return;
    }

    setActionItemError("");
    setIsCreatingActionItem(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/action-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        status: formData.get("status"),
        priority: formData.get("priority"),
        dueDate: formData.get("dueDate") || null,
        goalId: formData.get("goalId") || null,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setActionItemError(data.error || "Action item creation failed.");
      setIsCreatingActionItem(false);
      return;
    }

    setActionItems((currentActionItems) => [...currentActionItems, data.actionItem]);
    event.currentTarget.reset();
    setIsCreatingActionItem(false);
  }

  return (
    <div className="mt-10 border border-stone-200 p-4 dark:border-stone-800">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
          Action Items
        </p>
        <div className="flex gap-2">
          <button
            className={`min-h-[44px] border px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${
              viewMode === "list"
                ? "border-stone-900 bg-stone-900 text-stone-50 dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950"
                : "border-stone-300 text-stone-900 hover:bg-stone-900 hover:text-stone-50 dark:border-stone-700 dark:text-stone-50 dark:hover:bg-stone-50 dark:hover:text-stone-950"
            }`}
            onClick={() => setViewMode("list")}
            type="button"
          >
            List
          </button>
          <button
            className={`min-h-[44px] border px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${
              viewMode === "board"
                ? "border-stone-900 bg-stone-900 text-stone-50 dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950"
                : "border-stone-300 text-stone-900 hover:bg-stone-900 hover:text-stone-50 dark:border-stone-700 dark:text-stone-50 dark:hover:bg-stone-50 dark:hover:text-stone-950"
            }`}
            onClick={() => setViewMode("board")}
            type="button"
          >
            Board
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="grid gap-3">
          {viewMode === "list" ? (
            actionItems.length ? (
              actionItems.map((actionItem) => (
                <div key={actionItem.id} className="border border-stone-200 p-4 dark:border-stone-800">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                    {actionItem.status} · {actionItem.priority}
                  </p>
                  <p className="mt-3 text-xl font-light tracking-tight">{actionItem.title}</p>
                  <p className="mt-2 text-sm text-stone-900/70 dark:text-stone-50/70">
                    {actionItem.goalId ? "Linked to a goal." : "No goal linked yet."}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-900/60 dark:text-stone-50/60">
                No action items yet.
              </p>
            )
          ) : (
            <p className="text-sm text-stone-900/60 dark:text-stone-50/60">
              Kanban view is coming next in this slice.
            </p>
          )}
          {isLoadingActionItems ? (
            <p className="text-sm text-stone-900/60 dark:text-stone-50/60">Loading action items…</p>
          ) : null}
        </div>
        <form className="grid gap-4 border border-stone-200 p-4 dark:border-stone-800" onSubmit={handleCreateActionItem}>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
            Create Action Item
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
            Description
            <textarea
              className="min-h-[112px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
              name="description"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
              Status
              <select
                className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                defaultValue="TODO"
                name="status"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
              Priority
              <select
                className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                defaultValue="MEDIUM"
                name="priority"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
              Due date
              <input
                className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                name="dueDate"
                type="date"
              />
            </label>
            <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
              Parent goal
              <select
                className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                defaultValue=""
                name="goalId"
              >
                <option value="">None</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {actionItemError ? (
            <p className="border border-[#c8102e]/20 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#9d1028] dark:text-[#ff8c9d]">
              {actionItemError}
            </p>
          ) : null}
          <button
            className="min-h-[44px] border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.22em] text-stone-50 transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950 dark:hover:bg-stone-200 dark:focus-visible:ring-stone-50"
            disabled={isCreatingActionItem}
            type="submit"
          >
            {isCreatingActionItem ? "Creating…" : "Create action item"}
          </button>
        </form>
      </div>
    </div>
  );
}
