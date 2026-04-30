"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiUrl } from "@/lib/runtime";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardShell({ user }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  async function handleLogout() {
    setIsLoggingOut(true);

    await fetch(`${apiUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    clearUser();
    router.push("/login");
    router.refresh();
    setIsLoggingOut(false);
  }

  return (
    <main className="flex-1 border-b border-stone-200 bg-stone-50 text-stone-900 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50">
      <section className="mx-auto grid min-h-screen max-w-6xl grid-cols-12 gap-4 px-4 py-16 md:gap-8 md:px-8 md:py-24 lg:py-32">
        <div className="col-span-12 border border-stone-200 bg-stone-100 p-6 dark:border-stone-800 dark:bg-stone-900 md:col-span-8 md:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-900/45 dark:text-stone-50/45">
            Protected Workspace
          </p>
          <h1 className="mt-6 max-w-[12ch] text-4xl font-light leading-tight tracking-tight text-balance md:text-6xl">
            Welcome, {user.displayName || user.email}.
          </h1>
          <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-stone-900/70 dark:text-stone-50/70 md:text-lg">
            The dashboard route is protected by the current cookie session. The next slices will replace this shell with live Workspace data.
          </p>
          <dl className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="border border-stone-200 px-4 py-4 dark:border-stone-800">
              <dt className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                Email
              </dt>
              <dd className="mt-3 text-base text-stone-900 dark:text-stone-50">{user.email}</dd>
            </div>
            <div className="border border-stone-200 px-4 py-4 dark:border-stone-800">
              <dt className="text-xs uppercase tracking-[0.2em] text-stone-900/40 dark:text-stone-50/40">
                Profile ID
              </dt>
              <dd className="mt-3 font-mono text-sm tabular-nums text-stone-900 dark:text-stone-50">
                {user.id}
              </dd>
            </div>
          </dl>
        </div>

        <div className="col-span-12 flex flex-col justify-between border border-stone-200 bg-[#c8102e] p-6 text-stone-50 dark:border-stone-800 md:col-span-4 md:p-8 lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-50/70">Session Controls</p>
            <p className="mt-6 text-2xl font-light leading-snug tracking-tight md:text-3xl">
              Cookie-backed auth is live.
            </p>
          </div>
          <button
            className="mt-10 min-h-[44px] border border-stone-50/30 px-4 py-3 text-sm uppercase tracking-[0.22em] transition hover:bg-stone-50/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-50"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      </section>
    </main>
  );
}
