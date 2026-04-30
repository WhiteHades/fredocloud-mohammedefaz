import { cookies } from "next/headers";

import { apiUrl } from "./runtime";

async function fetchFromApi(path) {
  const cookieStore = await cookies();

  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getWorkspaceMemberships() {
  const data = await fetchFromApi("/api/workspaces");

  return data?.memberships || [];
}

export async function getPendingInvitations() {
  const data = await fetchFromApi("/api/workspaces/invitations");

  return data?.invitations || [];
}
