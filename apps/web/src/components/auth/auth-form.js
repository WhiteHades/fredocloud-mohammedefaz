"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { apiUrl } from "@/lib/runtime";
import { useAuthStore } from "@/stores/auth-store";

const FORM_COPY = {
  login: {
    action: `${apiUrl}/api/auth/login`,
    cta: "Log in",
    heading: "Enter the workspace.",
    prompt: "Need an account?",
    promptHref: "/register",
    promptLabel: "Create one",
  },
  register: {
    action: `${apiUrl}/api/auth/register`,
    cta: "Create account",
    heading: "Open a new workspace identity.",
    prompt: "Already registered?",
    promptHref: "/login",
    promptLabel: "Log in",
  },
};

export function AuthForm({ mode }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const copy = FORM_COPY[mode];

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    if (mode === "register") {
      payload.displayName = formData.get("displayName");
    }

    const response = await fetch(copy.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error || "The request could not be completed.");
      setIsPending(false);
      return;
    }

    setUser(data.user);

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });

    setIsPending(false);
  }

  return (
    <div className="border border-stone-200 bg-stone-100 p-6 dark:border-stone-800 dark:bg-stone-900 md:p-8">
      <p className="text-xs uppercase tracking-[0.24em] text-stone-900/45 dark:text-stone-50/45">
        FredoHub Authentication
      </p>
      <h1 className="mt-6 max-w-[14ch] text-4xl font-light leading-tight tracking-tight text-balance md:text-5xl">
        {copy.heading}
      </h1>
      <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
            Display name
            <input
              className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
              name="displayName"
              type="text"
              required
            />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
          Email
          <input
            className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-stone-900/70 dark:text-stone-50/70">
          Password
          <input
            className="min-h-[44px] border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </label>
        {error ? (
          <p className="border border-[#c8102e]/20 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#9d1028] dark:text-[#ff8c9d]">
            {error}
          </p>
        ) : null}
        <button
          className="min-h-[44px] border border-[#c8102e] bg-[#c8102e] px-4 py-3 text-sm uppercase tracking-[0.22em] text-stone-50 transition hover:bg-[#9d1028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8102e] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Submitting…" : copy.cta}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-900/60 dark:text-stone-50/60">
        {copy.prompt}{" "}
        <Link className="text-stone-900 dark:text-stone-50" href={copy.promptHref}>
          {copy.promptLabel}
        </Link>
      </p>
    </div>
  );
}
