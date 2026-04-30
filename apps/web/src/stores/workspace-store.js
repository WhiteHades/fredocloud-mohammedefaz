"use client";

import { create } from "zustand";

function getInitialWorkspaceId(memberships) {
  return memberships[0]?.workspace.id || null;
}

export const useWorkspaceStore = create((set) => ({
  activeWorkspaceId: null,
  memberships: [],
  syncMemberships: (memberships) =>
    set((state) => ({
      memberships,
      activeWorkspaceId:
        state.activeWorkspaceId &&
        memberships.some(({ workspace }) => workspace.id === state.activeWorkspaceId)
          ? state.activeWorkspaceId
          : getInitialWorkspaceId(memberships),
    })),
  setActiveWorkspaceId: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
}));
