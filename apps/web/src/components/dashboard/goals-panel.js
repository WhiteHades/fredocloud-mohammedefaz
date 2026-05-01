"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

export function GoalsPanel({ activeWorkspace, refreshKey }) {
  const [detailError, setDetailError] = useState("");
  const [detailGoal, setDetailGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [goalError, setGoalError] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  useEffect(() => {
    async function loadGoals() {
      if (!activeWorkspace) {
        setGoals([]);
        setSelectedGoalId(null);
        return;
      }

      setGoalError("");
      setIsLoadingGoals(true);

      const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setGoalError(data.error || "Goals could not be loaded.");
        setGoals([]);
        setSelectedGoalId(null);
        setIsLoadingGoals(false);
        return;
      }

      setGoals(data.goals);
      setSelectedGoalId((currentGoalId) =>
        currentGoalId && data.goals.some((goal) => goal.id === currentGoalId)
          ? currentGoalId
          : data.goals[0]?.id || null,
      );
      setIsLoadingGoals(false);
    }

    loadGoals();
  }, [activeWorkspace, refreshKey]);

  useEffect(() => {
    async function loadGoalDetail() {
      if (!selectedGoalId) {
        setDetailGoal(null);
        return;
      }

      setDetailError("");
      setIsLoadingDetail(true);

      const response = await fetch(`${apiUrl}/api/goals/${selectedGoalId}`, {
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setDetailError(data.error || "Goal detail could not be loaded.");
        setDetailGoal(null);
        setIsLoadingDetail(false);
        return;
      }

      setDetailGoal(data.goal);
      setIsLoadingDetail(false);
    }

    loadGoalDetail();
  }, [selectedGoalId, refreshKey]);

  async function handleCreateGoal(event) {
    event.preventDefault();

    if (!activeWorkspace) {
      return;
    }

    setGoalError("");
    setIsCreatingGoal(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${apiUrl}/api/workspaces/${activeWorkspace.id}/goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        dueDate: formData.get("dueDate") || null,
        status: formData.get("status"),
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setGoalError(data.error || "Goal creation failed.");
      setIsCreatingGoal(false);
      return;
    }

    const nextGoals = [...goals, data.goal];
    setGoals(nextGoals);
    setSelectedGoalId(data.goal.id);
    event.currentTarget.reset();
    setIsCreatingGoal(false);
  }

  async function handleAddMilestone(event) {
    event.preventDefault();

    if (!selectedGoalId) {
      return;
    }

    setDetailError("");
    setIsAddingMilestone(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${apiUrl}/api/goals/${selectedGoalId}/milestones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title: formData.get("title"),
        progressPercentage: Number(formData.get("progressPercentage") || 0),
        dueDate: formData.get("dueDate") || null,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setDetailError(data.error || "Milestone creation failed.");
      setIsAddingMilestone(false);
      return;
    }

    setDetailGoal((currentGoal) =>
      currentGoal
        ? { ...currentGoal, milestones: [...currentGoal.milestones, data.milestone] }
        : currentGoal,
    );
    event.currentTarget.reset();
    setIsAddingMilestone(false);
  }

  async function handleAddUpdate(event) {
    event.preventDefault();

    if (!selectedGoalId) {
      return;
    }

    setDetailError("");
    setIsAddingUpdate(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`${apiUrl}/api/goals/${selectedGoalId}/updates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        content: formData.get("content"),
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setDetailError(data.error || "Progress update failed.");
      setIsAddingUpdate(false);
      return;
    }

    setDetailGoal((currentGoal) =>
      currentGoal
        ? { ...currentGoal, updates: [...currentGoal.updates, data.update] }
        : currentGoal,
    );
    event.currentTarget.reset();
    setIsAddingUpdate(false);
  }

  const selectedGoal = detailGoal || goals.find((goal) => goal.id === selectedGoalId) || null;

  return (
    <div className="nfh-panel t-panel-slide" data-open="true">
      <p className="nfh-eyebrow">Goals</p>
      {activeWorkspace ? (
        <div className="mt-[10px] grid gap-[10px] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="grid gap-[10px]">
            {goals.map((goal) => {
              const isSelected = goal.id === selectedGoalId;

              return (
                <button
                  key={goal.id}
                  className={`border p-[20px] text-left transition-transform hover:scale-[1.01] active:scale-[0.99] ${
                    isSelected
                      ? "border-current bg-black text-[#e6e6dd]"
                      : "border-current bg-transparent"
                  }`}
                  onClick={() => setSelectedGoalId(goal.id)}
                  type="button"
                >
                  <p className="nfh-eyebrow">{goal.status.replaceAll("_", " ")}</p>
                  <p className="mt-[5px] text-[20px] leading-[1] tracking-[-0.009em]">{goal.title}</p>
                  <p className="mt-[10px] nfh-muted">
                    {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : "No due date set."}
                  </p>
                </button>
              );
            })}
            {isLoadingGoals ? (
              <p className="nfh-muted">Loading goals…</p>
            ) : null}
            {!isLoadingGoals && goals.length === 0 ? (
              <p className="nfh-muted">No goals yet. Create the first one below.</p>
            ) : null}
          </div>
          <div className="grid gap-[10px]">
            <div className="nfh-subpanel">
              <p className="nfh-eyebrow">Goal Detail</p>
              {selectedGoal ? (
                <div className="mt-[10px] grid gap-[10px]">
                  <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] leading-[0.95] tracking-[-0.02em]">{selectedGoal.title}</h2>
                  <p className="nfh-eyebrow">{selectedGoal.status.replaceAll("_", " ")}</p>
                  <p className="text-[20px] leading-[1.1] tracking-[-0.009em] opacity-75">
                    {selectedGoal.description || "No goal description yet."}
                  </p>
                  <div className="grid gap-[10px] md:grid-cols-2">
                    <div className="nfh-subpanel">
                      <p className="nfh-eyebrow">Milestones</p>
                      <div className="mt-[10px] grid gap-[10px]">
                        {selectedGoal.milestones?.length ? (
                          selectedGoal.milestones.map((milestone) => (
                            <div key={milestone.id} className="border border-current px-[16px] py-[14px]">
                              <p className="text-[20px] leading-[1] tracking-[-0.009em]">{milestone.title}</p>
                              <p className="mt-[5px] nfh-eyebrow">
                                {milestone.progressPercentage}% complete
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="nfh-muted">No milestones yet.</p>
                        )}
                      </div>
                    </div>
                    <div className="nfh-subpanel">
                      <p className="nfh-eyebrow">Progress Feed</p>
                      <div className="mt-[10px] grid gap-[10px]">
                        {selectedGoal.updates?.length ? (
                          selectedGoal.updates.map((update) => (
                            <div key={update.id} className="border border-current px-[16px] py-[14px]">
                              <p className="text-[20px] leading-[1.1] tracking-[-0.009em]">
                                {update.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="nfh-muted">No progress updates yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {detailError ? <p className="nfh-error">{detailError}</p> : null}
                  {isLoadingDetail ? (
                    <p className="nfh-muted">Loading detail…</p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-[10px] nfh-muted">Select a goal to inspect it.</p>
              )}
            </div>
            <form className="nfh-subpanel nfh-stack" onSubmit={handleAddMilestone}>
              <p className="nfh-eyebrow">Add Milestone</p>
              <label className="nfh-label">
                <span className="nfh-eyebrow">Title</span>
                <input
                  className="nfh-input outline-none focus:ring-2 focus:ring-accent"
                  name="title"
                  required
                  type="text"
                />
              </label>
              <div className="nfh-divider-grid nfh-divider-grid-2">
                <label className="nfh-label">
                  <span className="nfh-eyebrow">Progress percentage</span>
                  <input
                    className="nfh-input outline-none focus:ring-2 focus:ring-accent"
                    defaultValue="0"
                    name="progressPercentage"
                    max="100"
                    min="0"
                    type="number"
                  />
                </label>
                <label className="nfh-label">
                  <span className="nfh-eyebrow">Due date</span>
                  <input
                    className="nfh-input outline-none focus:ring-2 focus:ring-accent"
                    name="dueDate"
                    type="date"
                  />
                </label>
              </div>
              <button
                className="nfh-pill"
                disabled={!selectedGoalId || isAddingMilestone}
                type="submit"
              >
                {isAddingMilestone ? "Adding…" : "Add milestone"}
              </button>
            </form>
            <form className="nfh-subpanel nfh-stack" onSubmit={handleAddUpdate}>
              <p className="nfh-eyebrow">Post Progress Update</p>
              <label className="nfh-label">
                <span className="nfh-eyebrow">Update</span>
                <textarea
                  className="nfh-textarea outline-none focus:ring-2 focus:ring-accent"
                  name="content"
                  required
                />
              </label>
              <button
                className="nfh-pill"
                disabled={!selectedGoalId || isAddingUpdate}
                type="submit"
              >
                {isAddingUpdate ? "Posting…" : "Post update"}
              </button>
            </form>
            <form className="nfh-subpanel nfh-stack" onSubmit={handleCreateGoal}>
              <p className="nfh-eyebrow">Create Goal</p>
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
                  <span className="nfh-eyebrow">Due date</span>
                  <input
                    className="nfh-input outline-none focus:ring-2 focus:ring-accent"
                    name="dueDate"
                    type="date"
                  />
                </label>
                <label className="nfh-label">
                  <span className="nfh-eyebrow">Status</span>
                  <select
                    className="nfh-select outline-none focus:ring-2 focus:ring-accent"
                    defaultValue="NOT_STARTED"
                    name="status"
                  >
                    <option value="NOT_STARTED">Not started</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="AT_RISK">At risk</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </label>
              </div>
              {goalError ? <p className="nfh-error">{goalError}</p> : null}
              <button
                className="nfh-pill"
                disabled={isCreatingGoal}
                type="submit"
              >
                {isCreatingGoal ? "Creating…" : "Create goal"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p className="mt-[10px] nfh-muted">Select or create a workspace before planning goals.</p>
      )}
    </div>
  );
}
