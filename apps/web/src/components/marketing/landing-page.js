"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";

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
  ArrowUpRight,
} from "@phosphor-icons/react";

import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FEATURE_CARDS = [
  {
    title: "Workspaces",
    subtitle: "Multi-workspace control",
    description: "Spin up separate workspaces, invite teammates by email, and keep role-aware collaboration boundaries crisp.",
    icon: Buildings,
    accent: "#d4510a",
  },
  {
    title: "Goals",
    subtitle: "Goals with real momentum",
    description: "Track owners, due dates, milestones, and progress updates without losing the thread between planning and delivery.",
    icon: Target,
    accent: "#2563eb",
  },
  {
    title: "Announcements",
    subtitle: "Announcements that stay visible",
    description: "Publish rich updates, pin what matters, and keep reactions and comments live for the whole workspace.",
    icon: Megaphone,
    accent: "#7c3aed",
  },
  {
    title: "Action Items",
    subtitle: "Action boards that move fast",
    description: "Jump between list and kanban views, assign owners cleanly, and keep priorities explicit instead of implied.",
    icon: Checks,
    accent: "#059669",
  },
  {
    title: "Realtime",
    subtitle: "Realtime presence and notifications",
    description: "Mentions, presence, and activity feel immediate, so the product behaves like a live hub instead of a static shell.",
    icon: ActivityIcon,
    accent: "#dc2626",
  },
  {
    title: "Analytics",
    subtitle: "Analytics with exportability",
    description: "Track totals, completion velocity, overdue work, and export the workspace data without leaving the dashboard.",
    icon: ChartBar,
    accent: "#ca8a04",
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

function AnimatedCard({ card, index }) {
  const cardRef = useRef(null);
  const Icon = card.icon;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    function handleMouseMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      animate({
        targets: el,
        rotateY: x * 10,
        rotateX: -y * 10,
        duration: 500,
        easing: "easeOutCubic",
      });

      const glare = el.querySelector(".card-glare");
      if (glare) {
        animate({
          targets: glare,
          opacity: 0.12,
          translateX: `${x * 80}px`,
          translateY: `${y * 80}px`,
          duration: 500,
          easing: "easeOutCubic",
        });
      }
    }

    function handleMouseLeave() {
      animate({
        targets: el,
        rotateY: 0,
        rotateX: 0,
        duration: 700,
        easing: "easeOutElastic(1, 0.55)",
      });

      const glare = el.querySelector(".card-glare");
      if (glare) {
        animate({ targets: glare, opacity: 0, duration: 300 });
      }
    }

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate({
              targets: entry.target,
              opacity: [0, 1],
              translateY: [40, 0],
              scale: [0.9, 1],
              duration: 700,
              delay: index * 100,
              easing: "easeOutCubic",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group relative cursor-default overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:border-foreground/10 dark:bg-black/40 dark:border-white/10"
      style={{ transformStyle: "preserve-3d", perspective: "800px", opacity: 0 }}
    >
      <div
        className="card-glare pointer-events-none absolute inset-0 rounded-2xl opacity-0"
        style={{
          background: `radial-gradient(circle at center, ${card.accent}18 0%, transparent 65%)`,
        }}
      />
      <div style={{ transform: "translateZ(20px)" }}>
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${card.accent}12`, color: card.accent }}
          >
            <Icon className="size-5" />
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
            {card.title}
          </Badge>
        </div>
        <h3 className="mb-2 text-lg font-semibold font-heading tracking-tight">
          {card.subtitle}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
      </div>
    </div>
  );
}

export function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setVideoReady(video.readyState >= 3);
    function onReady() { setVideoReady(true); }
    video.addEventListener("canplaythrough", onReady, { once: true });
    return () => video.removeEventListener("canplaythrough", onReady);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;
    const chars = heroRef.current.querySelectorAll(".hero-char");

    animate({
      targets: chars,
      opacity: [0, 1],
      translateY: [50, 0],
      rotateX: [50, 0],
      duration: 800,
      delay: stagger(35, { from: "center" }),
      easing: "easeOutCubic",
    });
  }, []);

  const title = "notFredoHub";
  const heroChars = title.split("").map((char, i) => (
    <span key={i} className="hero-char inline-block" style={{ opacity: 0 }}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));

  return (
    <main className="bg-background text-foreground">
      <section className="px-4 pb-4 pt-4 md:px-6 md:pb-6">
        <div className="relative min-h-[92svh] overflow-hidden rounded-[2rem] border bg-card shadow-2xl dark:bg-black dark:border-white/10">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out dark:opacity-70"
            style={{ opacity: videoReady ? undefined : 0 }}
          >
            <source src="/ascii-art.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80 dark:from-black/40 dark:via-black/20 dark:to-black/80" />

          <div className="relative z-10 flex min-h-[92svh] flex-col">
            <header className="px-4 pt-4 md:px-6 md:pt-6">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border bg-background/75 px-4 py-2 text-sm shadow-lg backdrop-blur-xl md:gap-6 md:px-8 dark:bg-black/75 dark:border-white/10 dark:text-white">
                <a href="#features" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">
                  Features
                </a>
                <a href="#stack" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">
                  Stack
                </a>
                <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="hidden text-muted-foreground transition hover:text-foreground md:block dark:text-white/70 dark:hover:text-white">
                  API Docs
                </a>
                <ThemeToggle className="dark:text-white dark:hover:bg-white/10 dark:hover:text-white" />
                {user ? (
                  <Link
                    href="/dashboard"
                    className="ml-2 flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs transition hover:bg-accent dark:border-white/15 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <House className="size-3.5" />
                    {user.displayName || user.email}
                  </Link>
                ) : (
                  <div className="ml-2 flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild className="dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
                      <Link href="/login"><SignIn data-icon="inline-start" /> Log in</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/register"><UserPlus data-icon="inline-start" /> Register</Link>
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
                <h1
                  ref={heroRef}
                  className="font-heading text-[14vw] leading-[0.88] tracking-[-0.06em] text-foreground sm:text-[12vw] md:text-[7rem] lg:text-[9rem] dark:text-[#f4f0e6]"
                  style={{ perspective: "600px" }}
                >
                  {heroChars}
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
                    <a href={API_DOCS_URL} target="_blank" rel="noreferrer">
                      <ArrowUpRight data-icon="inline-start" /> API Docs
                    </a>
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
            <Badge variant="outline" className="dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              Product features
            </Badge>
            <h2 className="font-heading text-3xl tracking-tight md:text-4xl">
              Collaboration primitives kept close together in one cohesive surface.
            </h2>
            <p className="text-base leading-8 text-muted-foreground dark:text-white/68">
              Workspaces, goals, announcements, action items, notifications, presence, analytics, exports, and permission-aware management.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_CARDS.map((card, i) => (
              <AnimatedCard key={card.title} card={card} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 md:px-6" id="stack">
        <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border bg-card p-8 dark:border-white/10 dark:bg-black/40">
            <h3 className="font-heading text-3xl mb-3 dark:text-[#f4f0e6]">Built on a modern full-stack stack.</h3>
            <p className="text-sm leading-7 text-muted-foreground mb-6 dark:text-white/62">
              Turborepo monorepo, Next.js frontend, Express API, Prisma/Postgres data layer, Zustand state, Socket.IO, Cloudinary, Railway deployment, and Recharts analytics.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {STACK.map((item) => (
                <div key={item} className="rounded-2xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground transition hover:border-foreground/10 hover:text-foreground dark:border-white/8 dark:bg-white/[0.03] dark:text-white/78 dark:hover:text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-8 dark:border-white/10 dark:bg-black/40">
            <h3 className="font-heading text-2xl mb-4 dark:text-[#f4f0e6]">Product polish</h3>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground dark:text-white/68">
              <p>Light, dark, and system appearance controls.</p>
              <p>Command palette navigation, audit and workspace CSV exports, and seeded demo flows.</p>
              <p>Dashboard interactions tuned to feel immediate, with realtime updates baked in.</p>
              <div className="pt-2">
                <Button asChild>
                  <Link href={user ? "/dashboard" : "/login"}>{user ? "Go to Dashboard" : "Try the demo"}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
