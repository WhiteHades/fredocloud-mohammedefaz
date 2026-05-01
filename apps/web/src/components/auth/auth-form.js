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

    try {
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
    } catch {
      setError("The server could not be reached. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="border border-current p-[24px]">
      <p className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
        notFredoHub Authentication
      </p>
      <h1 className="mt-[10px] text-[clamp(2rem,5vw,3rem)] font-medium leading-[0.95] tracking-[-0.02em]">
        {copy.heading}
      </h1>
      <form className="mt-[10px] flex flex-col gap-[10px]" action={copy.action} method="POST" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <label className="flex flex-col gap-[5px]">
            <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
              Display name
            </span>
            <input
              className="h-[48px] border border-current bg-transparent px-[16px] text-[20px] tracking-[-0.009em] outline-none focus:ring-2 focus:ring-accent"
              name="displayName"
              type="text"
              required
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
            Email
          </span>
          <input
            className="h-[48px] border border-current bg-transparent px-[16px] text-[20px] tracking-[-0.009em] outline-none focus:ring-2 focus:ring-accent"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="flex flex-col gap-[5px]">
          <span className="text-[11px] uppercase tracking-[-0.005em] opacity-60">
            Password
          </span>
          <input
            className="h-[48px] border border-current bg-transparent px-[16px] text-[20px] tracking-[-0.009em] outline-none focus:ring-2 focus:ring-accent"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
        </label>
        {error ? (
          <p className="border border-accent bg-accent/10 px-[16px] py-[12px] text-[11px] uppercase tracking-[-0.005em] text-accent">
            {error}
          </p>
        ) : null}
        <button
          className="h-[56px] rounded-[300px] bg-white px-[24px] text-[20px] tracking-[-0.009em] text-black transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Submitting…" : copy.cta}
        </button>
      </form>
      <p className="mt-[10px] text-[11px] uppercase tracking-[-0.005em] opacity-60">
        {copy.prompt}{" "}
        <Link className="text-foreground underline" href={copy.promptHref}>
          {copy.promptLabel}
        </Link>
      </p>
    </div>
  );
}
