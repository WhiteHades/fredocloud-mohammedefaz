import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { apiUrl } from "./runtime";

export async function getSessionUser() {
  const cookieStore = await cookies();

  const response = await fetch(`${apiUrl}/api/auth/me`, {
    headers: {
      cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
