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

export function LandingPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="bg-black text-white">
      <section className="px-4 pb-4 pt-4 md:px-6 md:pb-6">
        <div className="relative min-h-[92svh] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          >
            <source src="/ascii-art.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

          <div className="relative z-10 flex min-h-[92svh] flex-col">
            <header className="px-4 pt-4 md:px-6 md:pt-6">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/75 px-4 py-2 text-sm shadow-lg backdrop-blur-xl md:gap-6 md:px-8">
                <span className="font-heading font-semibold tracking-[0.24em] text-white/80">notFredoHub</span>
                <a href="#features" className="hidden text-white/70 transition hover:text-white md:block">Features</a>
                <a href="#stack" className="hidden text-white/70 transition hover:text-white md:block">Stack</a>
                <a href="/api/docs" target="_blank" rel="noreferrer" className="hidden text-white/70 transition hover:text-white md:block">API Docs</a>
                {user ? (
                  <div className="ml-2 flex items-center gap-3">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90 transition hover:bg-white/10 hover:text-white"
                    >
                      <House className="size-3.5" />
                      {user.displayName || user.email}
                    </Link>
                  </div>
                ) : (
                  <div className="ml-2 flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-white">
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
                  <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">Collaborative Team Hub</Badge>
                  <Badge variant="outline" className="border-white/15 bg-black/20 text-white/80">Realtime Planning</Badge>
                </div>
                <h1 className="font-heading text-[14vw] leading-[0.88] tracking-[-0.06em] text-[#f4f0e6] sm:text-[12vw] md:text-[7rem] lg:text-[9rem]">
                  notFredoHub
                </h1>
              </div>

              <div className="md:col-span-4 lg:col-span-5 md:self-end md:pb-2 md:pt-10">
                <p className="text-sm leading-7 text-white/76 md:text-right">
                  A collaborative team hub for shared workspaces, goals, announcements, action items, realtime presence, and fast decision-making.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
                  <Button size="lg" asChild>
                    <Link href={user ? "/dashboard" : "/login"}>
                      <SignIn data-icon="inline-start" /> {user ? "Dashboard" : "Open the App"}
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white">
                    <a href="/api/docs" target="_blank" rel="noreferrer">API Docs</a>
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
            <Badge variant="outline" className="border-white/10 bg-white/5 text-white/70">Product features</Badge>
            <h2 className="font-heading text-3xl tracking-tight text-[#f4f0e6] md:text-4xl">
              Collaboration primitives kept close together in one cohesive surface.
            </h2>
            <p className="text-base leading-8 text-white/68">
              Workspaces, goals, announcements, action items, notifications, presence, analytics, exports, and permission-aware management.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_CARDS.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title} className="border-white/10 bg-white/[0.04] text-white shadow-none backdrop-blur-sm">
                  <CardHeader className="space-y-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <Icon className="size-5 text-white/80" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#f4f0e6]">{feature.title}</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-7 text-white/62">{feature.description}</CardDescription>
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
          <Card className="border-white/10 bg-[#111111] text-white shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-3xl text-[#f4f0e6]">Built on a modern full-stack stack.</CardTitle>
              <CardDescription className="text-sm leading-7 text-white/62">
                Turborepo monorepo, Next.js frontend, Express API, Prisma/Postgres data layer, Zustand state, Socket.IO, Cloudinary, Railway deployment, and Recharts analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {STACK.map((item) => (
                <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/78">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] text-white shadow-none">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-[#f4f0e6]">Product polish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-white/68">
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
