"use client";

import Link from "next/link";

import {
  ActivityIcon,
  Buildings,
  ChartBar,
  Checks,
  Megaphone,
  SignIn,
  Target,
  UserPlus,
  House,
} from "@phosphor-icons/react";

import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURE_CARDS = [
  {
    title: "Multi-workspace control",
    description: "Spin up separate workspaces, invite teammates by email, and keep role-aware collaboration boundaries crisp.",
    icon: Buildings,
  },
  {
    title: "Goals with real momentum",
    description: "Track owners, due dates, milestones, and progress updates without losing the thread between planning and delivery.",
    icon: Target,
  },
  {
    title: "Announcements that stay visible",
    description: "Publish rich updates, pin what matters, and keep reactions and comments live for the whole workspace.",
    icon: Megaphone,
  },
  {
    title: "Action boards that move fast",
    description: "Jump between list and kanban views, assign owners cleanly, and keep priorities explicit instead of implied.",
    icon: Checks,
  },
  {
    title: "Realtime presence and notifications",
    description: "Mentions, presence, and activity feel immediate, so the product behaves like a live hub instead of a static shell.",
    icon: ActivityIcon,
  },
  {
    title: "Analytics with exportability",
    description: "Track totals, completion velocity, overdue work, and export the workspace data without leaving the dashboard.",
    icon: ChartBar,
  },
];

const STACK = [
  "Next.js App Router",
  "Express + Prisma",
  "PostgreSQL",
  "Zustand",
  "Socket.IO",
  "Cloudinary",
  "Recharts",
  "Railway",
];

const API_DOCS_URL = "https://fredocloud-mohammedefaz-production.up.railway.app/api/docs";

export function LandingPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="bg-background text-foreground">
      <section className="px-4 pb-4 pt-4 md:px-6 md:pb-6">
        <div className="relative min-h-[92svh] overflow-hidden rounded-[2rem] border bg-card shadow-2xl dark:bg-black dark:border-white/10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-40 dark:opacity-70"
          >
            <source src="/ascii-art.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80 dark:from-black/40 dark:via-black/20 dark:to-black/80" />

          <div className="relative z-10 flex min-h-[92svh] flex-col">
            <header className="px-4 pt-4 md:px-6 md:pt-6">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border bg-background/75 px-4 py-2 text-sm shadow-lg backdrop-blur-xl md:gap-6 md:px-8 dark:bg-black/75 dark:border-white/10 dark:text-white">
                <a href="#features" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">Features</a>
                <a href="#stack" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">Stack</a>
                <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">API Docs</a>
                <ThemeToggle className="dark:text-white dark:hover:bg-white/10 dark:hover:text-white" />
                {user ? (
                  <div className="ml-2 flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs transition hover:bg-accent dark:border-white/15 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <House className="size-3.5" />
                      {user.displayName || user.email}
                    </Link>
                  </div>
                ) : (
                  <div className="ml-2 flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
                      <Link href="/login">
                        <SignIn data-icon="inline-start" /> Log in
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/register">
                        <UserPlus data-icon="inline-start" /> Register
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </header>

            <div className="mt-auto flex flex-col gap-8 px-6 pb-8 pt-16 md:grid md:grid-cols-12 md:px-10 md:pb-10 lg:px-14 lg:pb-14">
              <div className="md:col-span-8 lg:col-span-7">
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="dark:border-white/10 dark:bg-white/10 dark:text-white">Collaborative Team Hub</Badge>
                  <Badge variant="outline" className="dark:border-white/15 dark:bg-black/20 dark:text-white/80">Realtime Planning</Badge>
                </div>
                <h1 className="font-heading text-[14vw] leading-[0.88] tracking-[-0.06em] text-foreground sm:text-[12vw] md:text-[7rem] lg:text-[9rem] dark:text-[#f4f0e6]">
                  notFredoHub
                </h1>
              </div>

              <div className="md:col-span-4 lg:col-span-5 md:self-end md:pb-2 md:pt-10">
                <p className="text-sm leading-7 text-muted-foreground md:text-right dark:text-white/76">
                  A collaborative team hub for shared workspaces, goals, announcements, action items, realtime presence, and fast decision-making.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
                  <Button size="lg" asChild>
                    <Link href={user ? "/dashboard" : "/login"}>
                      <SignIn data-icon="inline-start" /> {user ? "Dashboard" : "Open the App"}
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="dark:border-white/15 dark:bg-black/30 dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
                    <a href={API_DOCS_URL} target="_blank" rel="noreferrer">API Docs</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 md:px-6" id="features">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="max-w-3xl space-y-4">
            <Badge variant="outline" className="dark:border-white/10 dark:bg-white/5 dark:text-white/70">Product features</Badge>
            <h2 className="font-heading text-3xl tracking-tight text-foreground md:text-4xl dark:text-[#f4f0e6]">
              Collaboration primitives kept close together in one cohesive surface.
            </h2>
            <p className="text-base leading-8 text-muted-foreground dark:text-white/68">
              Workspaces, goals, announcements, action items, notifications, presence, analytics, exports, and permission-aware management.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none dark:backdrop-blur-sm">
                  <CardHeader className="space-y-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl border bg-muted dark:border-white/10 dark:bg-white/5">
                      <Icon className="size-5 text-muted-foreground dark:text-white/80" />
                    </div>
                    <div>
                      <CardTitle className="text-xl dark:text-[#f4f0e6]">{feature.title}</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-7 dark:text-white/62">{feature.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 md:px-6" id="stack">
        <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Card className="dark:border-white/10 dark:bg-[#111111] dark:text-white dark:shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-3xl dark:text-[#f4f0e6]">Built on a modern full-stack stack.</CardTitle>
              <CardDescription className="text-sm leading-7 dark:text-white/62">
                Turborepo monorepo, Next.js frontend, Express API, Prisma/Postgres data layer, Zustand state, Socket.IO, Cloudinary, Railway deployment, and Recharts analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {STACK.map((item) => (
                <div key={item} className="rounded-2xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground dark:border-white/8 dark:bg-white/[0.03] dark:text-white/78">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-2xl dark:text-[#f4f0e6]">Product polish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground dark:text-white/68">
              <p>Light, dark, and system appearance controls.</p>
              <p>Command palette navigation, audit and workspace CSV exports, and seeded demo flows.</p>
              <p>Dashboard interactions tuned to feel immediate, with realtime updates baked in.</p>
              <div className="pt-2">
                <Button asChild>
                  <Link href={user ? "/dashboard" : "/login"}>{user ? "Go to Dashboard" : "Try the demo"}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
