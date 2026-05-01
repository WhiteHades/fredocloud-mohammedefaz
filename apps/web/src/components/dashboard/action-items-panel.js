"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

export function ActionItemsPanel({ activeWorkspace, refreshKey }) {
  const [actionItemError, setActionItemError] = useState("");
  const [actionItems, setActionItems] = useState([]);
  const [goals, setGoals] = useState([]);
  const [isCreatingActionItem, setIsCreatingActionItem] = useState(false);
  const [isLoadingActionItems, setIsLoadingActionItems] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  async function handleStatusChange(actionItemId, status) {
    const response = await fetch(`${apiUrl}/api/action-items/${actionItemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setActionItemError(data.error || "Action item update failed.");
      return;
    }

    setActionItems((currentActionItems) =>
      currentActionItems.map((actionItem) =>
        actionItem.id === actionItemId ? data.actionItem : actionItem,
      ),
    );
  }

  const boardColumns = {
    TODO: actionItems.filter((actionItem) => actionItem.status === "TODO"),
    IN_PROGRESS: actionItems.filter((actionItem) => actionItem.status === "IN_PROGRESS"),
    BLOCKED: actionItems.filter((actionItem) => actionItem.status === "BLOCKED"),
    DONE: actionItems.filter((actionItem) => actionItem.status === "DONE"),
  };

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
  }, [activeWorkspace, refreshKey]);

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
    <div className="nfh-panel t-panel-slide" data-open="true">
      <div className="flex items-center justify-between gap-[10px]">
        <p className="nfh-eyebrow">Action Items</p>
        <div className="flex gap-[10px]">
          <button
            className={`nfh-chip ${
              viewMode === "list"
                ? "nfh-chip-active"
                : ""
            }`}
            onClick={() => setViewMode("list")}
            type="button"
          >
            List
          </button>
          <button
            className={`nfh-chip ${
              viewMode === "board"
                ? "nfh-chip-active"
                : ""
            }`}
            onClick={() => setViewMode("board")}
            type="button"
          >
            Board
          </button>
        </div>
      </div>
      <div className="mt-[10px] grid gap-[10px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-[10px]">
          {viewMode === "list" ? (
            actionItems.length ? (
              actionItems.map((actionItem) => (
                <div key={actionItem.id} className="nfh-subpanel">
                  <p className="nfh-eyebrow">
                    {actionItem.status.replaceAll("_", " ")} · {actionItem.priority}
                  </p>
                  <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">{actionItem.title}</p>
                  <p className="mt-[10px] nfh-muted">
                    {actionItem.goalId ? "Linked to a goal." : "No goal linked yet."}
                  </p>
                  <div className="mt-[10px] flex flex-wrap gap-[10px]">
                    {["TODO", "IN_PROGRESS", "BLOCKED", "DONE"].map((status) => (
                      <button
                        key={status}
                        className={`nfh-chip ${actionItem.status === status ? "nfh-chip-active" : ""}`}
                        onClick={() => handleStatusChange(actionItem.id, status)}
                        type="button"
                      >
                        {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="nfh-muted">No action items yet.</p>
            )
          ) : (
            <div className="grid gap-[10px] xl:grid-cols-4">
              {Object.entries(boardColumns).map(([status, items]) => (
                <div key={status} className="nfh-subpanel">
                  <p className="nfh-eyebrow">
                    {status.replace("_", " ")}
                  </p>
                  <div className="mt-[10px] grid gap-[10px]">
                    {items.length ? (
                      items.map((actionItem) => (
                        <div key={actionItem.id} className="border border-current px-[16px] py-[14px]">
                          <p className="nfh-eyebrow">
                            {actionItem.priority}
                          </p>
                          <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">
                            {actionItem.title}
                          </p>
                          <div className="mt-[10px] flex flex-wrap gap-[10px]">
                            {["TODO", "IN_PROGRESS", "BLOCKED", "DONE"].map((nextStatus) => (
                              <button
                                key={nextStatus}
                                className={`nfh-chip ${actionItem.status === nextStatus ? "nfh-chip-active" : ""}`}
                                onClick={() => handleStatusChange(actionItem.id, nextStatus)}
                                type="button"
                              >
                                {nextStatus.replace("_", " ")}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="nfh-muted">No items.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {isLoadingActionItems ? (
            <p className="nfh-muted">Loading action items…</p>
          ) : null}
        </div>
        <form className="nfh-subpanel nfh-stack" onSubmit={handleCreateActionItem}>
          <p className="nfh-eyebrow">Create Action Item</p>
          <label className="nfh-label">
            <span className="nfh-eyebrow">Title</span>
            <input
              className="nfh-input outline-none focus:ring-2 focus:ring-accent"
              name="title"
              required
              type="text"
            />
          </label>
          <label className="nfh-label">
            <span className="nfh-eyebrow">Description</span>
            <textarea
              className="nfh-textarea outline-none focus:ring-2 focus:ring-accent"
              name="description"
            />
          </label>
          <div className="nfh-divider-grid nfh-divider-grid-2">
            <label className="nfh-label">
              <span className="nfh-eyebrow">Status</span>
              <select
                className="nfh-select outline-none focus:ring-2 focus:ring-accent"
                defaultValue="TODO"
                name="status"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
              </select>
            </label>
            <label className="nfh-label">
              <span className="nfh-eyebrow">Priority</span>
              <select
                className="nfh-select outline-none focus:ring-2 focus:ring-accent"
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
          <div className="nfh-divider-grid nfh-divider-grid-2">
            <label className="nfh-label">
              <span className="nfh-eyebrow">Due date</span>
              <input
                className="nfh-input outline-none focus:ring-2 focus:ring-accent"
                name="dueDate"
                type="date"
              />
            </label>
            <label className="nfh-label">
              <span className="nfh-eyebrow">Parent goal</span>
              <select
                className="nfh-select outline-none focus:ring-2 focus:ring-accent"
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
          {actionItemError ? <p className="nfh-error">{actionItemError}</p> : null}
          <button
            className="nfh-pill"
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
