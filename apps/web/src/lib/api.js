import { apiUrl } from "./runtime";

let refreshPromise = null;

async function attemptTokenRefresh() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetch(`${apiUrl}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  }).then(async (response) => {
    refreshPromise = null;
    return response.ok;
  }).catch(() => {
    refreshPromise = null;
    return false;
  });

  return refreshPromise;
}

export async function apiFetch(input, init = {}) {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.headers || {}),
    },
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await attemptTokenRefresh();

  if (!refreshed) {
    return response;
  }

  return fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.headers || {}),
    },
  });
}
