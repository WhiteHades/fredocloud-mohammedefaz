"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import {
  User,
  EnvelopeSimple,
  LockSimple,
  SignIn,
  UserPlus,
  Spinner,
} from "@phosphor-icons/react";

import { apiUrl } from "@/lib/runtime";
import { useAuthStore } from "@/stores/auth-store";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const FORM_COPY = {
  login: {
    action: `${apiUrl}/api/auth/login`,
    cta: "Log in",
    heading: "Welcome back",
    description: "Enter your credentials to access your workspaces.",
    prompt: "Need an account?",
    promptHref: "/register",
    promptLabel: "Create one",
    icon: SignIn,
  },
  register: {
    action: `${apiUrl}/api/auth/register`,
    cta: "Create account",
    heading: "Get started",
    description: "Create your account and join your team workspaces.",
    prompt: "Already registered?",
    promptHref: "/login",
    promptLabel: "Log in",
    icon: UserPlus,
  },
};

export function AuthForm({ mode }) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const copy = FORM_COPY[mode];
  const Icon = copy.icon;

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
        headers: { "Content-Type": "application/json" },
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
      });
    } catch {
      setError("The server could not be reached. Check your connection and try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
          <span className="text-lg font-bold text-primary-foreground font-heading">nF</span>
        </div>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-heading">{copy.heading}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" ? (
              <FieldGroup>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    name="displayName"
                    type="text"
                    placeholder="Display name"
                    className="pl-10 h-10"
                    required
                  />
                </div>
              </FieldGroup>
            ) : null}
            <FieldGroup>
              <div className="relative">
                <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  className="pl-10 h-10"
                  required
                />
              </div>
            </FieldGroup>
            <FieldGroup>
              <div className="relative">
                <LockSimple className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="pl-10 h-10"
                  required
                />
              </div>
            </FieldGroup>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" disabled={isPending} className="w-full h-10">
              {isPending ? (
                <>
                  <Spinner className="animate-spin" data-icon="inline-start" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icon data-icon="inline-start" />
                  {copy.cta}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {copy.prompt}{" "}
            <Link href={copy.promptHref} className="text-primary hover:underline font-medium">
              {copy.promptLabel}
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Demo: </span>
        demo@notfredohub.test / demo12345
      </p>
    </div>
  );
}
