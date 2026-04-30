"use client";

import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";

export function GoalsPanel({ activeWorkspace }) {
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
  }, [activeWorkspace]);

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
  }, [selectedGoalId]);

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
    <div className="mt-10 border border-stone-200 p-4 dark:border-stone-800">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
        Goals
      </p>
      {activeWorkspace ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="grid gap-3">
            {goals.map((goal) => {
              const isSelected = goal.id === selectedGoalId;

              return (
                <button
                  key={goal.id}
                  className={`border px-4 py-4 text-left transition ${
                    isSelected
                      ? "border-stone-900 bg-stone-900 text-stone-50 dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950"
                      : "border-stone-200 bg-stone-50 text-stone-900 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50 dark:hover:bg-stone-900"
                  }`}
                  onClick={() => setSelectedGoalId(goal.id)}
                  type="button"
                >
                  <p className="text-xs uppercase tracking-[0.2em] opacity-60">{goal.status}</p>
                  <p className="mt-3 text-xl font-light tracking-tight">{goal.title}</p>
                  <p className="mt-2 text-sm opacity-75">
                    {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : "No due date set."}
                  </p>
                </button>
              );
            })}
            {isLoadingGoals ? (
              <p className="text-sm text-stone-900/60 dark:text-stone-50/60">Loading goals…</p>
            ) : null}
            {!isLoadingGoals && goals.length === 0 ? (
              <p className="text-sm text-stone-900/60 dark:text-stone-50/60">
                No goals yet. Create the first one below.
              </p>
            ) : null}
          </div>
          <div className="grid gap-4">
            <div className="border border-stone-200 p-4 dark:border-stone-800">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                Goal Detail
              </p>
              {selectedGoal ? (
                <div className="mt-4 grid gap-3">
                  <h2 className="text-3xl font-light tracking-tight text-balance">{selectedGoal.title}</h2>
                  <p className="text-sm uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                    {selectedGoal.status}
                  </p>
                  <p className="max-w-[60ch] text-sm leading-relaxed text-stone-900/70 dark:text-stone-50/70">
                    {selectedGoal.description || "No goal description yet."}
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-stone-200 p-4 dark:border-stone-800">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                        Milestones
                      </p>
                      <div className="mt-4 grid gap-3">
                        {selectedGoal.milestones?.length ? (
                          selectedGoal.milestones.map((milestone) => (
                            <div key={milestone.id} className="border border-stone-200 px-3 py-3 dark:border-stone-800">
                              <p className="text-base text-stone-900 dark:text-stone-50">{milestone.title}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-900/45 dark:text-stone-50/45">
                                {milestone.progressPercentage}% complete
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-stone-900/60 dark:text-stone-50/60">
                            No milestones yet.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="border border-stone-200 p-4 dark:border-stone-800">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                        Progress Feed
                      </p>
                      <div className="mt-4 grid gap-3">
                        {selectedGoal.updates?.length ? (
                          selectedGoal.updates.map((update) => (
                            <div key={update.id} className="border border-stone-200 px-3 py-3 dark:border-stone-800">
                              <p className="text-sm leading-relaxed text-stone-900 dark:text-stone-50">
                                {update.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-stone-900/60 dark:text-stone-50/60">
                            No progress updates yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {detailError ? (
                    <p className="border border-[#c8102e]/20 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#9d1028] dark:text-[#ff8c9d]">
                      {detailError}
                    </p>
                  ) : null}
                  {isLoadingDetail ? (
                    <p className="text-sm text-stone-900/60 dark:text-stone-50/60">Loading detail…</p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-stone-900/60 dark:text-stone-50/60">
                  Select a goal to inspect it.
                </p>
              )}
            </div>
            <form className="grid gap-4 border border-stone-200 p-4 dark:border-stone-800" onSubmit={handleAddMilestone}>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                Add Milestone
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
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
                  Progress percentage
                  <input
                    className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                    defaultValue="0"
                    name="progressPercentage"
                    max="100"
                    min="0"
                    type="number"
                  />
                </label>
                <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
                  Due date
                  <input
                    className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                    name="dueDate"
                    type="date"
                  />
                </label>
              </div>
              <button
                className="min-h-[44px] border border-stone-900 px-4 py-3 text-sm uppercase tracking-[0.22em] transition hover:bg-stone-900 hover:text-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-50 dark:hover:bg-stone-50 dark:hover:text-stone-950 dark:focus-visible:ring-stone-50"
                disabled={!selectedGoalId || isAddingMilestone}
                type="submit"
              >
                {isAddingMilestone ? "Adding…" : "Add milestone"}
              </button>
            </form>
            <form className="grid gap-4 border border-stone-200 p-4 dark:border-stone-800" onSubmit={handleAddUpdate}>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                Post Progress Update
              </p>
              <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
                Update
                <textarea
                  className="min-h-[112px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                  name="content"
                  required
                />
              </label>
              <button
                className="min-h-[44px] border border-stone-900 px-4 py-3 text-sm uppercase tracking-[0.22em] transition hover:bg-stone-900 hover:text-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-50 dark:hover:bg-stone-50 dark:hover:text-stone-950 dark:focus-visible:ring-stone-50"
                disabled={!selectedGoalId || isAddingUpdate}
                type="submit"
              >
                {isAddingUpdate ? "Posting…" : "Post update"}
              </button>
            </form>
            <form className="grid gap-4 border border-stone-200 p-4 dark:border-stone-800" onSubmit={handleCreateGoal}>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                Create Goal
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
                  Due date
                  <input
                    className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                    name="dueDate"
                    type="date"
                  />
                </label>
                <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
                  Status
                  <select
                    className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
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
              {goalError ? (
                <p className="border border-[#c8102e]/20 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#9d1028] dark:text-[#ff8c9d]">
                  {goalError}
                </p>
              ) : null}
              <button
                className="min-h-[44px] border border-stone-900 bg-stone-900 px-4 py-3 text-sm uppercase tracking-[0.22em] text-stone-50 transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 dark:border-stone-50 dark:bg-stone-50 dark:text-stone-950 dark:hover:bg-stone-200 dark:focus-visible:ring-stone-50"
                disabled={isCreatingGoal}
                type="submit"
              >
                {isCreatingGoal ? "Creating…" : "Create goal"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-stone-900/60 dark:text-stone-50/60">
          Select or create a workspace before planning goals.
        </p>
      )}
    </div>
  );
}
